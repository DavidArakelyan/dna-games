package com.dnagames.model;

import java.util.Arrays;
import java.util.List;

/**
 * Complete enumeration of the 20 standard amino acids and stop codons with
 * their RNA codon mappings.
 * 
 * NOTE: This class is currently UNUSED in the application.
 * The Protein Synthesis game currently uses client-side JavaScript
 * (synthesis.js) for all
 * amino acid and codon logic.
 * 
 * FUTURE USE CASES:
 * This enum is reserved for potential server-side features including:
 * - REST API endpoints for mRNA/protein sequence generation and validation
 * - Server-side scoring and game state validation
 * - Protein sequence analysis and storage
 * - Educational tools for codon-to-amino-acid lookups
 * - Backend services for DNA transcription and translation workflows
 * 
 * The complete genetic code is implemented here (64 codons → 20 amino acids + 3
 * stop codons).
 */
public enum AminoAcid {
    // Start Codon
    METHIONINE("Met", "M", "AUG"),

    // Standard Amino Acids (alphabetical by full name)
    ALANINE("Ala", "A", "GCU", "GCC", "GCA", "GCG"),
    ARGININE("Arg", "R", "CGU", "CGC", "CGA", "CGG", "AGA", "AGG"),
    ASPARAGINE("Asn", "N", "AAU", "AAC"),
    ASPARTATE("Asp", "D", "GAU", "GAC"),
    CYSTEINE("Cys", "C", "UGU", "UGC"),
    GLUTAMATE("Glu", "E", "GAA", "GAG"),
    GLUTAMINE("Gln", "Q", "CAA", "CAG"),
    GLYCINE("Gly", "G", "GGU", "GGC", "GGA", "GGG"),
    HISTIDINE("His", "H", "CAU", "CAC"),
    ISOLEUCINE("Ile", "I", "AUU", "AUC", "AUA"),
    LEUCINE("Leu", "L", "UUA", "UUG", "CUU", "CUC", "CUA", "CUG"),
    LYSINE("Lys", "K", "AAA", "AAG"),
    PHENYLALANINE("Phe", "F", "UUU", "UUC"),
    PROLINE("Pro", "P", "CCU", "CCC", "CCA", "CCG"),
    SERINE("Ser", "S", "UCU", "UCC", "UCA", "UCG", "AGU", "AGC"),
    THREONINE("Thr", "T", "ACU", "ACC", "ACA", "ACG"),
    TRYPTOPHAN("Trp", "W", "UGG"),
    TYROSINE("Tyr", "Y", "UAU", "UAC"),
    VALINE("Val", "V", "GUU", "GUC", "GUA", "GUG"),

    // Stop Codons
    STOP("STOP", "Stop", "UAA", "UAG", "UGA");

    private final String name; // 3-letter abbreviation (e.g., "Met", "Ala")
    private final String abbr; // 1-letter code or special designation (e.g., "M", "A", "Start", "Stop")
    private final List<String> codons; // RNA codons that encode this amino acid

    AminoAcid(String name, String abbr, String... codons) {
        this.name = name;
        this.abbr = abbr;
        this.codons = Arrays.asList(codons);
    }

    /**
     * @return The 3-letter amino acid abbreviation (e.g., "Met", "Ala")
     */
    public String getName() {
        return name;
    }

    /**
     * @return The 1-letter amino acid code or special designation (e.g., "M", "A",
     *         "Start", "Stop")
     */
    public String getAbbr() {
        return abbr;
    }

    /**
     * @return List of RNA codons (triplets) that encode this amino acid
     */
    public List<String> getCodons() {
        return codons;
    }

    /**
     * Lookup amino acid by RNA codon.
     * 
     * @param codon The RNA codon (e.g., "AUG", "UUU")
     * @return The corresponding AminoAcid, or null if codon is not recognized
     */
    public static AminoAcid fromCodon(String codon) {
        if (codon == null) {
            return null;
        }

        String upperCodon = codon.toUpperCase();
        for (AminoAcid aa : values()) {
            if (aa.codons.contains(upperCodon)) {
                return aa;
            }
        }
        return null;
    }

    /**
     * Check if this amino acid is the start codon (Methionine/AUG).
     * 
     * @return true if this is Methionine (start codon)
     */
    public boolean isStartCodon() {
        return this == METHIONINE;
    }

    /**
     * Check if this is a stop codon.
     * 
     * @return true if this is a stop codon
     */
    public boolean isStopCodon() {
        return this == STOP;
    }
}
