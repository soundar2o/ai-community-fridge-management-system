package com.communityfridge.controller;

import com.communityfridge.dto.*;
import com.communityfridge.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/demand/predict")
    public ResponseEntity<AiDemandResponseDto> predictDemand(@RequestBody AiDemandRequestDto request) {
        return ResponseEntity.ok(aiService.predictDemand(request));
    }

    @PostMapping("/waste/predict")
    public ResponseEntity<AiWasteResponseDto> predictWasteRisk(@RequestBody AiWasteRequestDto request) {
        return ResponseEntity.ok(aiService.predictWasteRisk(request));
    }

    @PostMapping("/recommend/fridges")
    public ResponseEntity<Map<String, Object>> getFridgeRecommendations(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(aiService.getFridgeRecommendations(request));
    }

    @PostMapping(value = "/freshness/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiFreshnessResponseDto> analyzeFreshness(@RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(aiService.analyzeFreshness(image));
    }
}
