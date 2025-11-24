package com.dnagames.service;

import com.dnagames.model.Nucleotide;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class DnaService {

    private final Random random = new Random();

    public List<String> generateRandomStrand(int length) {
        List<String> strand = new ArrayList<>();
        Nucleotide[] values = Nucleotide.values();
        for (int i = 0; i < length; i++) {
            strand.add(values[random.nextInt(values.length)].getSymbol());
        }
        return strand;
    }

    public boolean validatePair(String base1, String base2) {
        try {
            Nucleotide n1 = Nucleotide.fromSymbol(base1);
            Nucleotide n2 = Nucleotide.fromSymbol(base2);
            return n1.getPairSymbol().equals(n2.getSymbol());
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public List<String> transcribe(List<String> dnaStrand) {
        return dnaStrand.stream()
                .map(base -> {
                    try {
                        Nucleotide n = Nucleotide.fromSymbol(base);
                        // DNA A -> RNA U
                        // DNA T -> RNA A
                        // DNA C -> RNA G
                        // DNA G -> RNA C
                        if (n == Nucleotide.ADENINE) return "U";
                        if (n == Nucleotide.THYMINE) return "A";
                        if (n == Nucleotide.CYTOSINE) return "G";
                        if (n == Nucleotide.GUANINE) return "C";
                        return "?";
                    } catch (Exception e) {
                        return "?";
                    }
                })
                .collect(Collectors.toList());
    }
}
