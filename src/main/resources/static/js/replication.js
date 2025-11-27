document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    window.nextPage = function (pageNumber) {
        document.querySelectorAll('.comic-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageNumber}`).classList.add('active');

        if (pageNumber === 3) {
            initGame();
        }
    };

    window.prevPage = function (pageNumber) {
        document.querySelectorAll('.comic-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageNumber}`).classList.add('active');
    };

    // --- Game Logic ---
    // Game State
    let score = 0;
    let mistakes = 0;
    let currentStep = 0;

    // Timers
    let globalTime = 0;
    let stageTime = 15;
    let globalTimerInterval = null;
    let stageTimerInterval = null;
    const TARGET_GLOBAL_TIME = 180; // 3 minutes target

    // DOM Elements
    const scoreEl = document.getElementById('score');
    const mistakesEl = document.getElementById('mistakes');
    const globalTimerEl = document.getElementById('global-timer');
    const stageTimerEl = document.getElementById('stage-timer');
    const stepText = document.getElementById('step-text');
    const enzymeOverlay = document.getElementById('enzyme-action-area');
    const activeEnzymeImg = document.getElementById('active-enzyme-img');
    const enzymeMessage = document.getElementById('enzyme-message');
    const nucleotidePool = document.getElementById('nucleotide-pool');
    const gameArea = document.querySelector('.game-area');

    // Containers
    const leadingTemplate = document.getElementById('leading-template');
    const laggingTemplate = document.getElementById('lagging-template');
    const middleContainer = document.getElementById('middle-container');
    const middleRow = document.getElementById('row-middle');
    const rowLeading = document.getElementById('row-leading-template');
    const rowLagging = document.getElementById('row-lagging-template');

    // DNA Sequence (Template 3'-5' for Leading)
    let sequence = [];

    // Dynamic Containers for New Strands
    let leadingNew = null;
    let laggingNew = null;

    window.initGame = initGame;
    function initGame() {
        score = 0;
        mistakes = 0;
        currentStep = 0;
        updateScore();

        // Reset Timers
        resetTimers();
        startGlobalTimer();

        // Generate Random Sequence (Length 10)
        sequence = generateRandomSequence(10);

        // Shuffle Toolbox
        shuffleToolbox();

        // Cleanup Final State Artifacts
        document.querySelectorAll('.final-bond-row').forEach(el => el.remove());
        document.querySelectorAll('.separator-row').forEach(el => el.remove());
        document.querySelectorAll('.new-strand-row').forEach(el => el.remove());

        // Restore DOM Structure
        if (!middleRow.parentNode) {
            // If middleRow was removed, re-insert it
            gameArea.insertBefore(middleRow, rowLagging);
        }
        // Ensure correct order: Leading -> Middle -> Lagging
        gameArea.prepend(rowLeading);
        rowLeading.after(middleRow);
        middleRow.after(rowLagging);

        // Clear all strands
        leadingTemplate.innerHTML = '';
        laggingTemplate.innerHTML = '';
        // middleContainer.innerHTML = ''; // Redundant as we reset middleRow below

        // Reset Middle Row Style & Content
        middleRow.className = 'strand-row middle-row';
        middleRow.innerHTML = '<div class="strand-label"></div><div class="nucleotide-container" id="middle-container"></div>';
        // Re-fetch middleContainer after reset
        const newMiddleContainer = document.getElementById('middle-container');

        // Reset Visibility & Final State
        rowLeading.classList.remove('hidden-row');
        rowLagging.classList.remove('hidden-row');
        middleRow.classList.remove('hidden-row');
        gameArea.classList.remove('final-state');

        // Remove Play Again button if exists
        const existingBtn = document.querySelector('.play-again-btn');
        if (existingBtn) existingBtn.remove();

        // 1. Setup Leading Strand Template (Top)
        sequence.forEach((base, index) => {
            const nuc = createNucleotide(base, index, 'leading-t');
            leadingTemplate.appendChild(nuc);
        });

        // 2. Setup Middle Row (Bonds)
        sequence.forEach((base, index) => {
            const bond = document.createElement('div');
            bond.className = 'bond-placeholder';
            bond.textContent = (base === 'C' || base === 'G') ? '|||' : '||';
            bond.id = `bond-${index}`;
            newMiddleContainer.appendChild(bond);
        });

        // 3. Setup Lagging Strand Template (Bottom)
        sequence.forEach((base, index) => {
            const complementBase = getComplement(base);
            const nuc = createNucleotide(complementBase, index, 'lagging-t');
            laggingTemplate.appendChild(nuc);
        });

        setStep(0);
    }

    // --- Timer Logic ---
    function resetTimers() {
        stopTimers();
        globalTime = 0;
        stageTime = 15;
        updateTimerDisplay();
    }

    function stopTimers() {
        clearInterval(globalTimerInterval);
        clearInterval(stageTimerInterval);
    }

    function startGlobalTimer() {
        clearInterval(globalTimerInterval);
        globalTimerInterval = setInterval(() => {
            globalTime++;
            updateTimerDisplay();
        }, 1000);
    }

    function startStageTimer() {
        clearInterval(stageTimerInterval);
        stageTime = 15;
        stageTimerEl.classList.remove('low-time');
        updateTimerDisplay();

        stageTimerInterval = setInterval(() => {
            if (stageTime > 0) {
                stageTime--;
                if (stageTime <= 5) stageTimerEl.classList.add('low-time');
                updateTimerDisplay();
            } else {
                clearInterval(stageTimerInterval);
                // Time's up for bonus, but game continues
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        // Global: MM:SS
        const minutes = Math.floor(globalTime / 60).toString().padStart(2, '0');
        const seconds = (globalTime % 60).toString().padStart(2, '0');
        globalTimerEl.textContent = `${minutes}:${seconds}`;

        // Stage: SS
        stageTimerEl.textContent = stageTime;
    }

    function awardStageBonus() {
        clearInterval(stageTimerInterval);
        if (stageTime > 0) {
            const bonus = stageTime * 10;
            score += bonus;
            // Visual feedback could be added here
            console.log(`Stage Bonus: +${bonus}`);
        }
    }

    function generateRandomSequence(length) {
        const bases = ['A', 'T', 'C', 'G'];
        const seq = [];
        for (let i = 0; i < length; i++) {
            seq.push(bases[Math.floor(Math.random() * bases.length)]);
        }
        return seq;
    }

    function shuffleToolbox() {
        const grid = document.querySelector('.toolbox-grid');
        const items = Array.from(grid.children);
        // Fisher-Yates Shuffle
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            grid.appendChild(items[j]);
        }
    }

    function createNucleotide(base, index, idPrefix) {
        const nuc = document.createElement('div');
        nuc.className = `nucleotide ${base}`;
        nuc.textContent = base;
        nuc.dataset.base = base;
        nuc.id = `${idPrefix}-${index}`;
        return nuc;
    }

    window.setStep = setStep;
    function setStep(step) {
        // Award bonus for previous step (if any)
        if (currentStep < step && step > 0) {
            awardStageBonus();
        }

        currentStep = step;
        nucleotidePool.style.display = 'none';
        const toolbox = document.getElementById('enzyme-toolbox');
        if (toolbox) toolbox.style.display = 'block';

        document.querySelectorAll('.tool-item').forEach(item => item.classList.remove('selected'));

        // Visual Guidance: Highlight Toolbox
        if (step < 5) {
            toolbox.classList.add('highlight-toolbox');
        } else {
            toolbox.classList.remove('highlight-toolbox');
        }

        // Start Stage Timer for new step
        if (step < 5) {
            startStageTimer();
        } else {
            clearInterval(stageTimerInterval); // Stop stage timer on finish
        }

        switch (step) {
            case 0: // Helicase
                stepText.textContent = "Step 1: Separate the strands!";
                break;
            case 1: // Primase
                stepText.textContent = "Step 2: Prepare for replication!";
                break;
            case 2: // Polymerase Leading
                stepText.textContent = "Step 3: Build the Leading Strand!";
                break;
            case 3: // Polymerase Lagging
                stepText.textContent = "Step 4: Build the Lagging Strand!";
                break;
            case 4: // Ligase
                stepText.textContent = "Step 5: Finalize the DNA!";
                break;
            case 5: // Done
                stepText.textContent = "Replication Complete!";
                toolbox.style.display = 'none';
                stopTimers();

                // Global Bonus
                if (globalTime < TARGET_GLOBAL_TIME) {
                    const timeBonus = (TARGET_GLOBAL_TIME - globalTime) * 10;
                    score += timeBonus;
                    stepText.textContent += ` Time Bonus: +${timeBonus}!`;
                }
                updateScore();

                // Show all rows for final view
                rowLeading.classList.remove('hidden-row');
                rowLagging.classList.remove('hidden-row');
                if (leadingNew) leadingNew.style.display = 'flex';
                if (laggingNew) laggingNew.style.display = 'flex';

                const playAgainBtn = document.createElement('button');
                playAgainBtn.className = 'comic-btn play-again-btn';
                playAgainBtn.textContent = 'Play Again';
                playAgainBtn.onclick = initGame;
                document.querySelector('.controls').appendChild(playAgainBtn);
                break;
        }
    }

    window.toggleEnzyme = function (element) {
        element.classList.toggle('selected');
    };

    window.deployEnzymes = function () {
        const selectedEnzymes = Array.from(document.querySelectorAll('.tool-item.selected')).map(el => el.dataset.enzyme);
        let correct = false;
        const toolbox = document.getElementById('enzyme-toolbox');

        if (currentStep === 0) {
            if (selectedEnzymes.includes('Helicase') && selectedEnzymes.length === 1) {
                runHelicase();
                correct = true;
            }
        } else if (currentStep === 1) {
            if (selectedEnzymes.includes('Primase') && selectedEnzymes.length === 1) {
                runPrimase();
                correct = true;
            }
        } else if (currentStep === 2) {
            if (selectedEnzymes.includes('Polymerase') && selectedEnzymes.length === 1) {
                runPolymeraseLeading();
                correct = true;
            }
        } else if (currentStep === 3) {
            if (selectedEnzymes.includes('Polymerase') && selectedEnzymes.length === 1) {
                runPolymeraseLagging();
                correct = true;
            }
        } else if (currentStep === 4) {
            if (selectedEnzymes.includes('Ligase') && selectedEnzymes.length === 1) {
                runLigase();
                correct = true;
            }
        }

        if (correct) {
            // Remove Visual Guidance on success
            toolbox.classList.remove('highlight-toolbox');
        } else {
            score = Math.max(0, score - 10); // Penalty for wrong enzyme
            mistakes++;
            updateScore();
            alert("Incorrect enzyme! Penalty: -10 points.");
        }
    };

    function runHelicase() {
        showEnzymeAction('Helicase', 'Unzipping DNA...', 2000, () => {
            middleRow.classList.add('unzipped');
            document.getElementById('middle-container').innerHTML = ''; // Remove bonds

            // Create containers
            leadingNew = document.createElement('div');
            leadingNew.className = 'new-strand-row';
            leadingNew.id = 'leading-new';

            laggingNew = document.createElement('div');
            laggingNew.className = 'new-strand-row';
            laggingNew.id = 'lagging-new';

            middleRow.appendChild(leadingNew);
            middleRow.appendChild(laggingNew);

            setTimeout(() => {
                leadingNew.classList.add('visible');
                laggingNew.classList.add('visible');
                setStep(1);
            }, 100);
        });
    }

    function runPrimase() {
        showEnzymeAction('Primase', 'Adding Primers...', 2000, () => {
            // Leading: 1 Primer at start
            addPrimer(leadingNew, 'Primer');
            addSpacer(leadingTemplate, 0); // Align template

            // Lagging: 2 Primers (Start + Middle)
            // Pattern: P - 5N - P - 5N

            // Fill laggingNew with placeholders first (10 total for sequence)
            for (let i = 0; i < sequence.length; i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'nucleotide placeholder';
                placeholder.style.visibility = 'hidden'; // Invisible spacers
                laggingNew.appendChild(placeholder);
            }

            // Insert Primers and Spacers
            // Primer 1 at original index 0
            insertPrimerAt(laggingNew, 0);
            addSpacer(laggingTemplate, 0);

            // Primer 2 at original index 5 (which is now index 6 in the DOM due to first primer/spacer)
            insertPrimerAt(laggingNew, 6);
            addSpacer(laggingTemplate, 6);

            setStep(2);
        });
    }

    function addPrimer(container, text) {
        const primer = document.createElement('div');
        primer.className = 'nucleotide primer'; // Add class for Ligase
        primer.style.backgroundColor = 'orange';
        primer.textContent = text;
        // Prepend for Leading
        if (container.firstChild) {
            container.insertBefore(primer, container.firstChild);
        } else {
            container.appendChild(primer);
        }
    }

    function addSpacer(container, index) {
        const spacer = document.createElement('div');
        spacer.className = 'spacer';
        const refNode = container.children[index];
        if (refNode) {
            container.insertBefore(spacer, refNode);
        } else {
            container.appendChild(spacer);
        }
    }

    function insertPrimerAt(container, index) {
        const primer = document.createElement('div');
        primer.className = 'nucleotide primer';
        primer.style.backgroundColor = 'orange';
        primer.textContent = 'Primer';

        const refNode = container.children[index];
        if (refNode) {
            container.insertBefore(primer, refNode);
        } else {
            container.appendChild(primer);
        }
    }

    function runPolymeraseLeading() {
        document.getElementById('enzyme-toolbox').style.display = 'none';
        nucleotidePool.style.display = 'flex';

        // Focus View: Hide Lagging
        rowLagging.classList.add('hidden-row');
        if (laggingNew) laggingNew.style.display = 'none';

        setupDragAndDrop('leading');
    }

    function runPolymeraseLagging() {
        document.getElementById('enzyme-toolbox').style.display = 'none';
        nucleotidePool.style.display = 'flex';

        // Focus View: Hide Leading, Show Lagging
        rowLeading.classList.add('hidden-row');
        if (leadingNew) leadingNew.style.display = 'none';

        rowLagging.classList.remove('hidden-row');
        if (laggingNew) laggingNew.style.display = 'flex';

        setupDragAndDrop('lagging');
    }

    function setupDragAndDrop(strandType) {
        const targetContainer = strandType === 'leading' ? leadingNew : laggingNew;
        const templateContainer = strandType === 'leading' ? leadingTemplate : laggingTemplate;

        // Convert placeholders to slots for lagging strand
        const children = Array.from(targetContainer.children);

        children.forEach((child, i) => {
            if (child.classList.contains('placeholder')) {
                // Find corresponding template nucleotide (templateContainer now has spacers)
                const templateNode = templateContainer.children[i];

                if (templateNode && templateNode.classList.contains('nucleotide')) {
                    const slot = document.createElement('div');
                    slot.className = 'nucleotide slot';
                    slot.dataset.target = getComplement(templateNode.dataset.base);
                    slot.dataset.index = i; // DOM index

                    slot.ondragover = allowDrop;
                    slot.ondrop = (ev) => drop(ev, strandType);

                    targetContainer.replaceChild(slot, child);
                }
            }
        });

        // Leading Strand specific: Append slots if missing
        if (strandType === 'leading') {
            const currentLen = targetContainer.children.length;
            const templateLen = templateContainer.children.length;

            for (let i = currentLen; i < templateLen; i++) {
                const templateNode = templateContainer.children[i];
                if (templateNode.classList.contains('nucleotide')) {
                    const slot = document.createElement('div');
                    slot.className = 'nucleotide slot';
                    slot.dataset.target = getComplement(templateNode.dataset.base);
                    slot.dataset.index = i;

                    slot.ondragover = allowDrop;
                    slot.ondrop = (ev) => drop(ev, strandType);

                    targetContainer.appendChild(slot);
                }
            }
        }

        updateTargetHighlight(strandType);
    }

    function updateTargetHighlight(strandType) {
        const targetContainer = strandType === 'leading' ? leadingNew : laggingNew;
        const templateContainer = strandType === 'leading' ? leadingTemplate : laggingTemplate;

        // Remove old highlights
        document.querySelectorAll('.current-target').forEach(el => el.classList.remove('current-target'));

        // Find first empty slot
        const slots = Array.from(targetContainer.querySelectorAll('.slot'));
        const firstEmptySlot = slots.find(s => !s.classList.contains('filled'));

        if (firstEmptySlot) {
            const index = parseInt(firstEmptySlot.dataset.index);
            const templateNuc = templateContainer.children[index];
            if (templateNuc) templateNuc.classList.add('current-target');
        }
    }

    function drop(ev, strandType) {
        ev.preventDefault();
        const base = ev.dataTransfer.getData("text");
        const targetSlot = ev.target;

        if (!targetSlot.classList.contains('slot')) return;

        // Sequential Check
        const index = parseInt(targetSlot.dataset.index);
        const templateContainer = strandType === 'leading' ? leadingTemplate : laggingTemplate;
        const templateNuc = templateContainer.children[index];

        if (!templateNuc.classList.contains('current-target')) {
            return;
        }

        if (base === targetSlot.dataset.target) {
            targetSlot.textContent = base;
            targetSlot.className = `nucleotide ${base} filled`;
            targetSlot.style.border = '2px solid #333';
            score += 10;

            targetSlot.classList.remove('slot');
            targetSlot.ondragover = null;
            targetSlot.ondrop = null;

            const container = strandType === 'leading' ? leadingNew : laggingNew;
            const slotsLeft = container.querySelectorAll('.slot').length;

            if (slotsLeft === 0) {
                setTimeout(() => {
                    nucleotidePool.style.display = 'none';
                    if (strandType === 'leading') {
                        setStep(3); // To Lagging
                    } else {
                        setStep(4); // To Ligase
                    }
                }, 500);
            } else {
                updateTargetHighlight(strandType);
            }
        } else {
            mistakes++;
            score = Math.max(0, score - 5);
            targetSlot.style.borderColor = 'red';
            setTimeout(() => targetSlot.style.borderColor = '#ccc', 500);
        }
        updateScore();
    }

    function runLigase() {
        showEnzymeAction('Ligase', 'Sealing the strands...', 2000, () => {
            // 1. Trigger Animation: Fade out Primers and Spacers
            const primers = document.querySelectorAll('.primer');
            const spacers = document.querySelectorAll('.spacer');

            primers.forEach(el => el.classList.add('gluing-out'));
            spacers.forEach(el => el.classList.add('gluing-out'));

            // 2. Wait for animation (1s), then restructure DOM
            setTimeout(() => {
                primers.forEach(el => el.remove());
                spacers.forEach(el => el.remove());

                // --- 7-Row Grid Restructuring ---

                // 1. Clear Game Area (but keep references)
                // We will append rows in the correct order

                // Row 1: Original Leading Template (rowLeading)
                // Row 2: Bonds (New)
                // Row 3: New Leading Strand (leadingNew)
                // Row 4: Separator (New)
                // Row 5: New Lagging Strand (laggingNew)
                // Row 6: Bonds (New)
                // Row 7: Original Lagging Template (rowLagging)

                // Create Bond Rows
                const bondRow1 = createBondRow(sequence);
                const bondRow2 = createBondRow(sequence);

                // Create Separator
                const separator = document.createElement('div');
                separator.className = 'separator-row';

                // Detach elements to re-order
                // Note: leadingNew and laggingNew are currently in middleRow. 
                // We need to move them out.

                // Remove middleRow entirely as we don't need it in the final state
                middleRow.remove();

                // Append in new order
                gameArea.appendChild(rowLeading);
                gameArea.appendChild(bondRow1);
                gameArea.appendChild(leadingNew);
                gameArea.appendChild(separator);
                gameArea.appendChild(laggingNew);
                gameArea.appendChild(bondRow2);
                gameArea.appendChild(rowLagging);

                // Visual Polish
                gameArea.classList.add('final-state');
                leadingNew.style.borderColor = '#00ff00';
                laggingNew.style.borderColor = '#00ff00';

                // Ensure visibility
                leadingNew.classList.add('visible');
                laggingNew.classList.add('visible');
                leadingNew.style.display = 'flex';
                laggingNew.style.display = 'flex';

                setStep(5);
            }, 1000);
        });
    }

    function createBondRow(seq) {
        const row = document.createElement('div');
        row.className = 'final-bond-row';
        seq.forEach((base) => {
            const bond = document.createElement('div');
            bond.className = 'bond-placeholder';
            // A-T has 2 bonds, C-G has 3 bonds
            if (base === 'A' || base === 'T') {
                bond.textContent = '||';
            } else {
                bond.textContent = '|||';
            }
            row.appendChild(bond);
        });
        return row;
    }

    // Helpers
    function getComplement(base) {
        if (base === 'A') return 'T';
        if (base === 'T') return 'A';
        if (base === 'C') return 'G';
        if (base === 'G') return 'C';
        return '';
    }

    function allowDrop(ev) { ev.preventDefault(); }

    function showEnzymeAction(enzymeName, message, duration, callback) {
        activeEnzymeImg.src = `/images/${enzymeName.toLowerCase()}.png`;
        enzymeMessage.textContent = message;
        enzymeOverlay.classList.remove('hidden');
        setTimeout(() => {
            enzymeOverlay.classList.add('hidden');
            if (callback) callback();
        }, duration);
    }

    function updateScore() {
        scoreEl.textContent = score;
        mistakesEl.textContent = mistakes;
    }

    document.querySelectorAll('.nucleotide-pool .nucleotide').forEach(nuc => {
        nuc.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.setData("text", nuc.dataset.base);
        });
    });

    window.runHelicase = runHelicase;
    window.runPrimase = runPrimase;
    window.runPolymeraseLeading = runPolymeraseLeading;
    window.runPolymeraseLagging = runPolymeraseLagging;
    window.runLigase = runLigase;

    document.addEventListener('DOMContentLoaded', initGame);
});
