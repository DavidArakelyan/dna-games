package com.dnagames.model;

import java.util.Arrays;
import java.util.List;

public enum AminoAcid {
    METHIONINE("Met", "Start", "AUG"),
    PHENYLALANINE("Phe", "F", "UUU", "UUC"),
    LEUCINE("Leu", "L", "UUA", "UUG", "CUU", "CUC", "CUA", "CUG"),
    SERINE("Ser", "S", "UCU", "UCC", "UCA", "UCG"),
    STOP("STOP", "Stop", "UAA", "UAG", "UGA");

    private final String name;
    private final String abbr;
    private final List<String> codons;

    AminoAcid(String name, String abbr, String... codons) {
        this.name = name;
        this.abbr = abbr;
        this.codons = Arrays.asList(codons);
    }

    public String getName() {
        return name;
    }

    public List<String> getCodons() {
        return codons;
    }

    public static AminoAcid fromCodon(String codon) {
        for (AminoAcid aa : values()) {
            if (aa.codons.contains(codon)) {
                return aa;
            }
        }
        return null; // Or throw exception
    }
}
