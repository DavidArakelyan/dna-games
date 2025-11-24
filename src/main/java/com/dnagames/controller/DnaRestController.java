package com.dnagames.controller;

import com.dnagames.service.DnaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dna")
public class DnaRestController {

    private final DnaService dnaService;

    public DnaRestController(DnaService dnaService) {
        this.dnaService = dnaService;
    }

    @GetMapping("/generate")
    public List<String> generateStrand(@RequestParam(defaultValue = "10") int length) {
        return dnaService.generateRandomStrand(length);
    }

    @GetMapping("/transcribe")
    public List<String> transcribe(@RequestParam List<String> dna) {
        return dnaService.transcribe(dna);
    }
}
