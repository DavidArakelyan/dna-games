package com.dnagames.model;

public enum Nucleotide {
    ADENINE("A", "T", "Thymine"),
    THYMINE("T", "A", "Adenine"),
    CYTOSINE("C", "G", "Guanine"),
    GUANINE("G", "C", "Cytosine");

    private final String symbol;
    private final String pairSymbol;
    private final String name;

    Nucleotide(String symbol, String pairSymbol, String name) {
        this.symbol = symbol;
        this.pairSymbol = pairSymbol;
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getPairSymbol() {
        return pairSymbol;
    }

    public String getName() {
        return name;
    }
    
    public static Nucleotide fromSymbol(String symbol) {
        for (Nucleotide n : values()) {
            if (n.symbol.equalsIgnoreCase(symbol)) {
                return n;
            }
        }
        throw new IllegalArgumentException("Invalid nucleotide symbol: " + symbol);
    }
}
