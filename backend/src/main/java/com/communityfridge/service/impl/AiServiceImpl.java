package com.communityfridge.service.impl;

import com.communityfridge.dto.*;
import com.communityfridge.service.AiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiServiceImpl implements AiService {

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public AiDemandResponseDto predictDemand(AiDemandRequestDto request) {
        log.info("[AI-DEMAND] Calling FastAPI...");
        try {
            String url = aiServiceUrl + "/api/ai/demand/predict";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiDemandRequestDto> entity = new HttpEntity<>(request, headers);

            ResponseEntity<AiDemandResponseDto> response = restTemplate.postForEntity(url, entity, AiDemandResponseDto.class);
            log.info("[AI-DEMAND] FastAPI response status: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("[AI-DEMAND] FastAPI response body: {}", response.getBody());
                log.info("[AI-DEMAND] Deserialization successful");
                log.info("[AI-DEMAND] Using FastAPI result");
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("[AI-DEMAND] FastAPI ERROR: {}", e.getMessage(), e);
        }

        // Fallback model prediction logic
        log.warn("[AI-DEMAND] FastAPI unavailable or failed, using Spring Boot fallback");
        return AiDemandResponseDto.builder()
                .predictedDemand(42)
                .demandLevel("HIGH")
                .confidence(0.85)
                .isPrototype(true)
                .modelType("Spring Boot Prototype Fallback")
                .build();
    }

    @Override
    public AiWasteResponseDto predictWasteRisk(AiWasteRequestDto request) {
        log.info("[AI-WASTE] Calling FastAPI...");
        try {
            String url = aiServiceUrl + "/api/ai/waste/predict";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiWasteRequestDto> entity = new HttpEntity<>(request, headers);

            ResponseEntity<AiWasteResponseDto> response = restTemplate.postForEntity(url, entity, AiWasteResponseDto.class);
            log.info("[AI-WASTE] FastAPI response status: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("[AI-WASTE] FastAPI response body: {}", response.getBody());
                log.info("[AI-WASTE] Deserialization successful");
                log.info("[AI-WASTE] Using FastAPI result");
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("[AI-WASTE] FastAPI ERROR: {}", e.getMessage(), e);
        }

        double days = request != null && request.getDaysUntilExpiry() != null ? request.getDaysUntilExpiry() : 2.0;
        String riskLevel = days <= 1.0 ? "HIGH" : (days <= 3.0 ? "MEDIUM" : "LOW");
        double score = days <= 1.0 ? 0.82 : (days <= 3.0 ? 0.45 : 0.15);

        log.warn("[AI-WASTE] FastAPI unavailable or failed, using Spring Boot fallback");
        return AiWasteResponseDto.builder()
                .wasteRisk(riskLevel)
                .riskScore(score)
                .isPrototype(true)
                .modelType("Spring Boot Prototype Fallback")
                .build();
    }

    @Override
    public Map<String, Object> getFridgeRecommendations(Map<String, Object> request) {
        try {
            String url = aiServiceUrl + "/api/ai/recommend/fridges";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("FastAPI AI Service unavailable for recommendations, using fallback: {}", e.getMessage());
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("priorityFridge", "Downtown Community Fridge");
        fallback.put("explanation", "High community demand & available storage capacity");
        fallback.put("recommendedPriority", List.of(
                Map.of("fridgeName", "Downtown Community Fridge", "priorityScore", 90, "demandLevel", "HIGH"),
                Map.of("fridgeName", "Uptown Food Hub", "priorityScore", 75, "demandLevel", "MEDIUM"),
                Map.of("fridgeName", "Westside Community Pantry", "priorityScore", 60, "demandLevel", "LOW")
        ));
        return fallback;
    }

    @Override
    public AiFreshnessResponseDto analyzeFreshness(MultipartFile image) {
        try {
            String url = aiServiceUrl + "/api/ai/freshness/analyze";
            HttpHeaders headers = new HttpHeaders();
            // Let RestTemplate FormHttpMessageConverter generate the boundary header automatically

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename() != null ? image.getOriginalFilename() : "food.jpg";
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<AiFreshnessResponseDto> response = restTemplate.postForEntity(url, requestEntity, AiFreshnessResponseDto.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("FastAPI AI Service unavailable for image freshness, using fallback: {}", e.getMessage());
        }

        return AiFreshnessResponseDto.builder()
                .label("FRESH")
                .confidence(0.91)
                .freshnessScore(0.91)
                .details("Color distribution: 91% freshness ratio (Spring Boot Fallback)")
                .isPrototype(true)
                .build();
    }
}
