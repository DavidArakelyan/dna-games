package com.dnagames.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GameController {

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/replication")
    public String replication() {
        return "replication";
    }

    @GetMapping("/synthesis")
    public String synthesis() {
        return "synthesis";
    }
}
