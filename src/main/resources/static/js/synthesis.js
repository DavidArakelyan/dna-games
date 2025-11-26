document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    window.nextPage = function (pageNumber) {
        document.querySelectorAll('.comic-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageNumber}`).classList.add('active');

        if (pageNumber === 2) {
            startTranscription();
        } else if (pageNumber === 3) {
            startTranslation();
        }
    };

    window.prevPage = function (pageNumber) {
        document.querySelectorAll('.comic-page').forEach(page => page.classList.remove('active'));
        document.getElementById(`page-${pageNumber}`).classList.add('active');
    };

    // --- DOM Elements ---
    const dnaTemplate = document.getElementById('dna-template');
    const mrnaStrand = document.getElementById('mrna-strand');
    const mrnaDisplay = document.getElementById('mrna-display');
    const proteinChain = document.getElementById('protein-chain');
    const transcriptionArea = document.getElementById('transcription-area');
    const translationArea = document.getElementById('translation-area');
    const transcriptionControls = document.getElementById('transcription-controls');
    const translationControls = document.getElementById('translation-controls');

    const nextPhaseBtn = document.getElementById('next-phase-btn');
    const resetBtn = document.getElementById('reset-btn');
    const phaseDisplay = document.getElementById('phase');
    const scoreDisplay = document.getElementById('score');
    const messageArea = document.getElementById('message-area');
    const stepTextTranscription = document.getElementById('step-text-transcription');
    const stepTextTranslation = document.getElementById('step-text-translation');

    // Ribosome Sites
    const siteE = document.getElementById('site-e');
    const siteP = document.getElementById('site-p');
    const siteA = document.getElementById('site-a');

    let score = 0;
    let mistakes = 0;
    let currentDna = [];
    let currentMrna = [];
    let translationStep = 0; // Current codon index at A-site

    // Translation State
    let state = {
        pSite: null, // { aa: 'Met', anticodon: 'UAC' }
        aSite: null  // { aa: 'Phe', anticodon: 'AAA' }
    };

    // Amino Acid Data
    const codonTable = {
        'AUG': 'Met', 'UUU': 'Phe', 'UUC': 'Phe',
        'UUA': 'Leu', 'UUG': 'Leu', 'CUU': 'Leu',
        'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser',
        'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP',
        'GCA': 'Ala', 'GCC': 'Ala', 'GCG': 'Ala', 'GCU': 'Ala',
        'AGA': 'Arg', 'AGG': 'Arg', 'CGA': 'Arg', 'CGC': 'Arg', 'CGG': 'Arg', 'CGU': 'Arg',
        'AAC': 'Asn', 'AAU': 'Asn',
        'GAC': 'Asp', 'GAU': 'Asp',
        'UGC': 'Cys', 'UGU': 'Cys',
        'CAA': 'Gln', 'CAG': 'Gln',
        'GAA': 'Glu', 'GAG': 'Glu',
        'GGA': 'Gly', 'GGC': 'Gly', 'GGG': 'Gly', 'GGU': 'Gly',
        'CAC': 'His', 'CAU': 'His',
        'AUA': 'Ile', 'AUC': 'Ile', 'AUU': 'Ile',
        'AAA': 'Lys', 'AAG': 'Lys',
        'CCA': 'Pro', 'CCC': 'Pro', 'CCG': 'Pro', 'CCU': 'Pro',
        'ACA': 'Thr', 'ACC': 'Thr', 'ACG': 'Thr', 'ACU': 'Thr',
        'UGG': 'Trp',
        'UAC': 'Tyr', 'UAU': 'Tyr',
        'GUA': 'Val', 'GUC': 'Val', 'GUG': 'Val', 'GUU': 'Val'
    };

    // --- Transcription Logic ---
    function startTranscription() {
        phaseDisplay.textContent = 'Transcription';
        stepTextTranscription.textContent = 'Step 1: Transcribe DNA to mRNA!';

        // Reset State
        dnaTemplate.innerHTML = '';
        mrnaStrand.innerHTML = '';
        currentMrna = [];
        nextPhaseBtn.classList.add('hidden');

        // Generate DNA Sequence (Length 15 for 5 codons)
        // Ensure it starts with TAC (Met) for valid translation start
        const startCodon = ['T', 'A', 'C'];
        const remainingLength = 12; // 4 more codons
        const randomPart = generateRandomSequence(remainingLength);
        currentDna = [...startCodon, ...randomPart];

        renderDna(currentDna);
        prepareMrnaSlots(currentDna.length);

        // Show RNA Polymerase
        const poly = document.getElementById('rna-polymerase');
        poly.classList.remove('hidden');
        // Initial position calculation
        // Label (120) + Padding (10) - Bubble Center Offset (40) + Slot Half (25)
        // Approx 115px
        poly.style.left = '115px';
    }

    function generateRandomSequence(length) {
        const bases = ['A', 'T', 'C', 'G'];
        const seq = [];
        for (let i = 0; i < length; i++) {
            seq.push(bases[Math.floor(Math.random() * bases.length)]);
        }
        return seq;
    }

    function renderDna(strand) {
        strand.forEach(base => {
            const div = document.createElement('div');
            div.classList.add('nucleotide', 'template', base);
            div.textContent = base;
            dnaTemplate.appendChild(div);
        });
    }

    function prepareMrnaSlots(length) {
        for (let i = 0; i < length; i++) {
            const slot = document.createElement('div');
            slot.classList.add('nucleotide', 'slot');
            slot.dataset.index = i;
            slot.dataset.target = getComplementRNA(currentDna[i]);

            slot.addEventListener('dragover', allowDrop);
            slot.addEventListener('drop', dropTranscription);
            mrnaStrand.appendChild(slot);
        }
        highlightNextSlot(0);
    }

    function getComplementRNA(base) {
        // Handles both DNA->RNA (T->A) and RNA->Anticodon (U->A)
        const pairs = { 'A': 'U', 'T': 'A', 'C': 'G', 'G': 'C', 'U': 'A' };
        return pairs[base];
    }

    function highlightNextSlot(index) {
        // Remove old highlights
        document.querySelectorAll('.current-target').forEach(el => el.classList.remove('current-target'));

        const container = document.getElementById('mrna-strand');
        const slots = container.children;

        if (index < slots.length) {
            const slot = slots[index];
            slot.classList.add('current-target');

            // Move RNA Polymerase
            const poly = document.getElementById('rna-polymerase');

            // Use offsetLeft to get the actual position of the slot
            const slotLeft = slot.offsetLeft;
            const slotWidth = slot.offsetWidth;
            const polyWidth = 80; // RNA Polymerase bubble width

            // Center the polymerase bubble over the slot
            const polyLeft = slotLeft + (slotWidth / 2) - (polyWidth / 2);

            poly.style.left = `${polyLeft}px`;
        }
    }

    // Drag and Drop for Transcription
    const draggables = document.querySelectorAll('.nucleotide-pool .nucleotide');
    draggables.forEach(d => d.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.dataset.base);
    }));

    function allowDrop(e) { e.preventDefault(); }

    function dropTranscription(e) {
        e.preventDefault();
        const slot = e.target;

        // Ensure we are dropping on the current target slot
        if (!slot.classList.contains('current-target')) return;

        const base = e.dataTransfer.getData('text/plain');
        const targetBase = slot.dataset.target;

        if (base === targetBase) {
            // Success
            slot.textContent = base;
            slot.className = `nucleotide ${base} filled`;
            slot.classList.remove('slot', 'current-target');

            const index = parseInt(slot.dataset.index);
            currentMrna[index] = base;
            score += 10;
            updateScore();

            // Move to next
            const nextIndex = index + 1;
            if (nextIndex < currentDna.length) {
                highlightNextSlot(nextIndex);
            } else {
                finishTranscription();
            }
        } else {
            // Mistake
            mistakes++;
            score = Math.max(0, score - 5);
            updateScore();
            showMessage('Incorrect! Remember: A->U, T->A, C->G, G->C', 'error');
            slot.style.borderColor = 'red';
            setTimeout(() => slot.style.borderColor = '#ccc', 500);
        }
    }

    function finishTranscription() {
        showMessage('Transcription Complete! mRNA is ready.', 'success');
        document.getElementById('rna-polymerase').classList.add('hidden');
        nextPhaseBtn.classList.remove('hidden');
        stepTextTranscription.textContent = 'Transcription Complete! Click "Go to Translation" to proceed.';
    }

    // --- Transition Animation ---
    window.goToTranslation = function () {
        // 1. Create a visual clone of the mRNA strand
        const mrnaClone = document.createElement('div');
        mrnaClone.className = 'mrna-transition';

        const strandVisual = document.createElement('div');
        strandVisual.className = 'mrna-strand-visual';

        currentMrna.forEach(base => {
            const nuc = document.createElement('div');
            nuc.className = `mrna-nuc-mini ${base}`;
            strandVisual.appendChild(nuc);
        });
        mrnaClone.appendChild(strandVisual);

        // Position it over the current mRNA strand
        const rect = mrnaStrand.getBoundingClientRect();
        mrnaClone.style.top = `${rect.top + window.scrollY}px`;
        mrnaClone.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(mrnaClone);

        // 2. Animate movement to the "Ribosome" (approximate position on next page)
        setTimeout(() => {
            mrnaClone.style.top = `${rect.top + 300}px`; // Move down
            mrnaClone.style.opacity = '0';
            mrnaClone.style.transform = 'scale(0.5)';
        }, 100);

        // 3. Switch Page after animation
        setTimeout(() => {
            mrnaClone.remove();
            nextPage(3);
        }, 2000);
    };

    // --- Translation Logic ---
    function startTranslation() {
        phaseDisplay.textContent = 'Translation';
        stepTextTranslation.textContent = 'Step 2: Drag tRNA to the A-Site!';

        mrnaDisplay.innerHTML = '';
        proteinChain.innerHTML = '';

        // Reset Translation State
        state.pSite = null;
        state.aSite = null;
        translationStep = 0;

        // Clear Sites
        siteE.innerHTML = '';
        siteP.innerHTML = '';
        siteA.innerHTML = '';

        // Render mRNA grouped by codons
        for (let i = 0; i < currentMrna.length; i += 3) {
            const codonDiv = document.createElement('div');
            codonDiv.classList.add('codon-group');
            codonDiv.dataset.index = i / 3;

            for (let j = 0; j < 3 && i + j < currentMrna.length; j++) {
                const nuc = document.createElement('div');
                nuc.classList.add('nucleotide', currentMrna[i + j]);
                nuc.textContent = currentMrna[i + j];
                codonDiv.appendChild(nuc);
            }
            mrnaDisplay.appendChild(codonDiv);
        }

        // Initial Alignment: Center the first codon (index 0)
        alignMrnaToCenter(0);

        populateTRNAPool();

        // Hint Button Logic - Ensure Codon Wheel starts hidden
        const hintBtn = document.getElementById('hint-btn');
        const codonWheel = document.getElementById('codon-wheel');

        // Ensure it starts hidden
        codonWheel.classList.add('hidden');

        // Remove existing listener to avoid duplicates if restarted
        const newBtn = hintBtn.cloneNode(true);
        hintBtn.parentNode.replaceChild(newBtn, hintBtn);

        newBtn.addEventListener('click', () => {
            codonWheel.classList.toggle('hidden');
            newBtn.textContent = codonWheel.classList.contains('hidden') ? 'Show Codon Wheel Hint' : 'Hide Codon Wheel Hint';
        });
    }

    function alignMrnaToCenter(codonIndex) {
        // We want the active codon to be in the MIDDLE of the Ribosome.
        // The Ribosome container is centered.
        // The mrna-track is centered.
        // We need to shift mrna-display so that codon[codonIndex] is at the center of mrna-track.

        const codonWidth = 130; // Approx width of a codon group (40*3 + gaps)
        // If we want codonIndex to be at center:
        // We need to shift left by codonIndex * width.
        // Plus, we need to center the codon itself (width/2).

        // Let's assume the mrna-display is centered in the track initially.
        // If we translateX(0), the start of the strand is at the center? No, usually flex-start or center depending on CSS.
        // CSS says #mrna-display { display: flex; } inside .mrna-track { justify-content: center; }
        // So initially, the WHOLE strand is centered.

        // We want a SPECIFIC child to be centered.
        // Offset = (TotalWidth / 2) - (ChildPosition + ChildWidth / 2)
        // But since we are just shifting the whole strip...

        // Let's simplify:
        // Shift = - (codonIndex * codonWidth) + (Some Constant to Center)
        // If index 0: Shift should center the first block.
        // If index 1: Shift left by 1 block width.

        // Let's try calculating relative to the middle of the sequence length?
        // No, easier to just brute force the offset.
        // If we want index 0 to be center:
        // The strand starts at center minus half its width?
        // But wait, the strip grows to the right.
        // So we need to push it right by (ContainerWidth/2) - (CodonWidth/2).
        // Let's approximate.

        const initialOffset = 150; // Push right to center first codon
        const offset = initialOffset - (codonIndex * codonWidth);
        mrnaDisplay.style.transform = `translateX(${offset}px)`;

        // Highlight active codon
        document.querySelectorAll('.codon-group').forEach(g => g.classList.remove('active'));
        const groups = document.querySelectorAll('.codon-group');
        if (groups[codonIndex]) {
            groups[codonIndex].classList.add('active');
        }
    }

    function populateTRNAPool() {
        const pool = document.getElementById('trna-pool');
        pool.innerHTML = '';

        // 1. Generate "Needed" tRNAs (Strictly matching mRNA)
        const neededAminos = [];
        for (let i = 0; i < currentMrna.length; i += 3) {
            const codon = currentMrna.slice(i, i + 3).join('');
            const aa = codonTable[codon] || '?';
            const anticodon = getAnticodon(codon);
            neededAminos.push({ aa, anticodon });
        }

        // 2. Generate Abundant Distractors (Random AAs with Random Valid Anticodons)
        // User wants "abundance", so let's add ~15 distractors.
        const aminoAcids = ['Met', 'Phe', 'Leu', 'Ser', 'Ala', 'Arg', 'Asn', 'Asp', 'Cys', 'Gln', 'Glu', 'Gly', 'His', 'Ile', 'Lys', 'Pro', 'Thr', 'Trp', 'Tyr', 'Val'];

        for (let i = 0; i < 15; i++) {
            const randomAA = aminoAcids[Math.floor(Math.random() * aminoAcids.length)];
            // Find a valid codon for this AA
            const validCodons = Object.keys(codonTable).filter(key => codonTable[key] === randomAA);
            if (validCodons.length > 0) {
                const randomCodon = validCodons[Math.floor(Math.random() * validCodons.length)];
                const anticodon = getAnticodon(randomCodon);
                neededAminos.push({ aa: randomAA, anticodon: anticodon });
            }
        }

        // Shuffle
        const shuffled = neededAminos.sort(() => Math.random() - 0.5);

        shuffled.forEach(item => {
            const container = createTRNAElement(item);
            pool.appendChild(container);
        });

        // Setup Drop Zone (A-Site)
        const siteA = document.getElementById('site-a');
        siteA.addEventListener('dragover', allowDrop);
        siteA.addEventListener('drop', dropTranslation);
    }

    function createTRNAElement(item) {
        const container = document.createElement('div');
        container.className = 'trna-container';
        container.draggable = true;
        container.dataset.anticodon = item.anticodon;
        container.dataset.aa = item.aa;

        const ball = document.createElement('div');
        ball.className = 'amino-acid-ball';
        ball.textContent = item.aa;
        ball.style.backgroundColor = getAminoColor(item.aa);

        const body = document.createElement('div');
        body.className = 'trna-body';

        const anticodonBox = document.createElement('div');
        anticodonBox.className = 'anticodon-box';
        anticodonBox.textContent = item.anticodon;

        // body.appendChild(anticodonBox); // Removed to avoid clipping
        container.appendChild(ball);
        container.appendChild(body);
        container.appendChild(anticodonBox); // Append as sibling

        container.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(item));
        });

        return container;
    }

    function getAnticodon(codon) {
        return codon.split('').map(b => getComplementRNA(b)).join('');
    }

    function getAminoColor(aa) {
        const colors = {
            'Met': '#FFA500', 'Phe': '#32CD32', 'Leu': '#1E90FF',
            'Ser': '#FF69B4', 'STOP': '#FF0000', 'Ala': '#FFFF00',
            'Gly': '#00FFFF', 'Val': '#FF00FF'
        };
        return colors[aa] || '#808080';
    }

    function dropTranslation(e) {
        e.preventDefault();

        // Only allow drop if A-Site is empty (logically)
        if (state.aSite) {
            showMessage('A-Site is occupied! Wait for shift.', 'error');
            return;
        }

        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const currentCodonIdx = translationStep * 3;
        const currentCodon = currentMrna.slice(currentCodonIdx, currentCodonIdx + 3).join('');
        const expectedAnticodon = getAnticodon(currentCodon);

        if (data.anticodon === expectedAnticodon) {
            // Success
            score += 20;
            updateScore();

            // Visual: Place tRNA in A-Site
            const trnaVisual = createTRNAElement(data);
            trnaVisual.draggable = false; // Lock it
            siteA.innerHTML = '';
            siteA.appendChild(trnaVisual);

            // Update State
            state.aSite = data;

            // Trigger Peptide Bond & Shift Sequence
            setTimeout(() => performPeptideBondAndShift(), 500);

        } else {
            mistakes++;
            score = Math.max(0, score - 10);
            updateScore();
            showMessage(`Incorrect! Need tRNA ${expectedAnticodon} for ${currentCodon}`, 'error');
        }
    }

    function performPeptideBondAndShift() {
        // Check for STOP codon
        if (state.aSite.aa === 'STOP') {
            finishTranslation();
            return;
        }

        // Shift Ribosome (Move A -> P, P -> E, E -> Exit)
        // Amino acid will be added to chain AFTER it moves to P-site
        setTimeout(() => {
            shiftRibosome();
        }, 1000);
    }

    function shiftRibosome() {
        // Move P-Site content to E-Site
        const pContent = siteP.firstElementChild;
        const eContent = siteE.firstElementChild;

        // Clear E-Site (Exit)
        if (eContent) {
            eContent.classList.add('exiting');
            setTimeout(() => eContent.remove(), 500);
        }

        // Move P to E
        if (pContent) {
            // Remove AA from P-site tRNA (it's now part of the chain)
            const ball = pContent.querySelector('.amino-acid-ball');
            if (ball) ball.style.opacity = '0'; // Hide it

            siteE.appendChild(pContent);
        }

        // Move A to P
        const aContent = siteA.firstElementChild;
        if (aContent) {
            siteP.appendChild(aContent);

            // NOW add amino acid to protein chain (after it's in P-site)
            if (state.aSite) {
                const bead = document.createElement('div');
                bead.className = 'amino-acid-ball linked';
                bead.textContent = state.aSite.aa;
                bead.style.backgroundColor = getAminoColor(state.aSite.aa);

                if (proteinChain.children.length > 0) {
                    const bond = document.createElement('div');
                    bond.className = 'peptide-bond';
                    proteinChain.appendChild(bond);
                }
                proteinChain.appendChild(bead);
            }
        }

        // Update State
        state.pSite = state.aSite;
        state.aSite = null;

        // Move mRNA
        translationStep++;
        if (translationStep * 3 < currentMrna.length) {
            alignMrnaToCenter(translationStep);
        } else {
            finishTranslation();
        }
    }

    function finishTranslation() {
        showMessage('Protein Synthesis Complete!', 'success');
        stepTextTranslation.textContent = 'Protein Complete!';
        resetBtn.style.display = 'inline-block';
        resetBtn.classList.remove('hidden');
        document.querySelector('.codon-group.active')?.classList.remove('active');
    }

    function updateScore() {
        scoreDisplay.textContent = score;
        document.getElementById('mistakes').textContent = mistakes;
    }

    function showMessage(msg, type) {
        messageArea.textContent = msg;
        messageArea.className = `message ${type}`;
        messageArea.classList.remove('hidden');
        setTimeout(() => messageArea.classList.add('hidden'), 2000);
    }
});
