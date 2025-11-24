document.addEventListener('DOMContentLoaded', () => {
    const dnaTemplate = document.getElementById('dna-template');
    const mrnaStrand = document.getElementById('mrna-strand');
    const mrnaDisplay = document.getElementById('mrna-display');
    const proteinChain = document.getElementById('protein-chain');
    const transcriptionArea = document.getElementById('transcription-area');
    const translationArea = document.getElementById('translation-area');
    const transcriptionControls = document.getElementById('transcription-controls');
    const translationControls = document.getElementById('translation-controls');
    const aminoPool = document.getElementById('amino-pool');

    const startBtn = document.getElementById('start-btn');
    const nextPhaseBtn = document.getElementById('next-phase-btn');
    const resetBtn = document.getElementById('reset-btn');
    const phaseDisplay = document.getElementById('phase');
    const scoreDisplay = document.getElementById('score');
    const messageArea = document.getElementById('message-area');

    let score = 0;
    let currentDna = [];
    let currentMrna = [];
    let transcriptionIndex = 0;

    // Amino Acid Data (Simplified)
    const codonTable = {
        'AUG': 'Met', 'UUU': 'Phe', 'UUC': 'Phe',
        'UUA': 'Leu', 'UUG': 'Leu', 'CUU': 'Leu',
        'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser',
        'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP'
        // Add more as needed or fetch from server
    };

    startBtn.addEventListener('click', startTranscription);
    nextPhaseBtn.addEventListener('click', startTranslation);
    resetBtn.addEventListener('click', startTranscription);

    function startTranscription() {
        score = 0;
        updateScore();
        phaseDisplay.textContent = 'Transcription';
        transcriptionArea.classList.remove('hidden');
        translationArea.classList.add('hidden');
        transcriptionControls.classList.remove('hidden');
        translationControls.classList.add('hidden');
        startBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        nextPhaseBtn.classList.add('hidden');

        dnaTemplate.innerHTML = '';
        mrnaStrand.innerHTML = '';
        currentMrna = [];

        // Generate DNA that includes a Start codon (TAC in DNA -> AUG in RNA)
        // For simplicity, we'll just generate random for now and handle logic
        fetch('/api/dna/generate?length=9') // Multiple of 3
            .then(res => res.json())
            .then(data => {
                currentDna = data;
                renderDna(data);
                prepareMrnaSlots(data.length);
            });
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
            slot.classList.add('nucleotide-slot');
            slot.dataset.index = i;
            slot.addEventListener('dragover', allowDrop);
            slot.addEventListener('drop', dropTranscription);
            mrnaStrand.appendChild(slot);
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
        if (!slot.classList.contains('nucleotide-slot') || slot.hasChildNodes()) return;

        const base = e.dataTransfer.getData('text/plain');
        const index = parseInt(slot.dataset.index);
        const dnaBase = currentDna[index];

        if (validateRnaPair(dnaBase, base)) {
            const nuc = document.createElement('div');
            nuc.classList.add('nucleotide', base);
            nuc.textContent = base;
            slot.appendChild(nuc);
            slot.classList.add('filled');
            currentMrna[index] = base;
            score += 10;
            updateScore();
            checkTranscriptionComplete();
        } else {
            showMessage('Incorrect! A->U, T->A, C->G, G->C', 'error');
        }
    }

    function validateRnaPair(dna, rna) {
        const pairs = { 'A': 'U', 'T': 'A', 'C': 'G', 'G': 'C' };
        return pairs[dna] === rna;
    }

    function checkTranscriptionComplete() {
        if (currentMrna.filter(b => b).length === currentDna.length) {
            showMessage('Transcription Complete!', 'success');
            nextPhaseBtn.classList.remove('hidden');
        }
    }

    function startTranslation() {
        phaseDisplay.textContent = 'Translation';
        transcriptionArea.classList.add('hidden');
        translationArea.classList.remove('hidden');
        transcriptionControls.classList.add('hidden');
        translationControls.classList.remove('hidden');
        nextPhaseBtn.classList.add('hidden');

        mrnaDisplay.innerHTML = '';
        proteinChain.innerHTML = '';

        // Render mRNA grouped by codons
        for (let i = 0; i < currentMrna.length; i += 3) {
            const codonDiv = document.createElement('div');
            codonDiv.classList.add('codon-group');
            // Just visual grouping
            for (let j = 0; j < 3 && i + j < currentMrna.length; j++) {
                const nuc = document.createElement('div');
                nuc.classList.add('nucleotide', currentMrna[i + j]);
                nuc.textContent = currentMrna[i + j];
                codonDiv.appendChild(nuc);
            }
            mrnaDisplay.appendChild(codonDiv);
        }

        populateAminoAcids();
    }

    function populateAminoAcids() {
        aminoPool.innerHTML = '';
        // Add some dummy buttons for now
        const aminos = ['Met', 'Phe', 'Leu', 'Ser', 'STOP'];
        aminos.forEach(aa => {
            const btn = document.createElement('button');
            btn.classList.add('btn', 'amino-btn');
            btn.textContent = aa;
            btn.addEventListener('click', () => checkTranslation(aa));
            aminoPool.appendChild(btn);
        });
    }

    let translationStep = 0;

    function checkTranslation(selectedAa) {
        const startIdx = translationStep * 3;
        if (startIdx >= currentMrna.length) return;

        const codon = currentMrna.slice(startIdx, startIdx + 3).join('');
        const correctAa = codonTable[codon] || '?';

        if (selectedAa === correctAa) {
            const bead = document.createElement('div');
            bead.classList.add('amino-bead');
            bead.textContent = selectedAa;
            proteinChain.appendChild(bead);

            score += 20;
            translationStep++;
            updateScore();

            // Highlight next codon
            highlightCodon(translationStep);

            if (translationStep * 3 >= currentMrna.length) {
                showMessage('Protein Synthesis Complete!', 'success');
                resetBtn.style.display = 'inline-block';
            }
        } else {
            showMessage(`Incorrect! ${codon} codes for ${correctAa}`, 'error');
        }
    }

    function highlightCodon(step) {
        const groups = document.querySelectorAll('.codon-group');
        groups.forEach(g => g.classList.remove('active'));
        if (groups[step]) groups[step].classList.add('active');
    }

    function updateScore() {
        scoreDisplay.textContent = score;
    }

    function showMessage(msg, type) {
        messageArea.textContent = msg;
        messageArea.className = `message ${type}`;
        messageArea.classList.remove('hidden');
        setTimeout(() => messageArea.classList.add('hidden'), 2000);
    }
});
