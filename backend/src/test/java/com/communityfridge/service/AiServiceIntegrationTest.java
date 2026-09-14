package com.communityfridge.service;

import com.communityfridge.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AiServiceIntegrationTest {

    @Autowired
    private AiService aiService;

    @Test
    public void testDemandPredictionCallsFastApi() {
        AiDemandRequestDto request = AiDemandRequestDto.builder()
                .fridgeId(1L)
                .category("Cooked Meal")
                .historicalDemand(List.of(25, 35, 42))
                .build();

        AiDemandResponseDto response = aiService.predictDemand(request);
        assertNotNull(response);
        System.out.println("=== Demand Prediction Response ===");
        System.out.println("Predicted Demand: " + response.getPredictedDemand());
        System.out.println("Demand Level: " + response.getDemandLevel());
        System.out.println("Model Type: " + response.getModelType());
        System.out.println("Is Prototype: " + response.getIsPrototype());

        assertNotNull(response.getPredictedDemand());
        assertFalse(response.getModelType().contains("Spring Boot Prototype Fallback"),
                "Demand prediction should use FastAPI service result, not fallback!");
    }

    @Test
    public void testWastePredictionCallsFastApi() {
        AiWasteRequestDto request = AiWasteRequestDto.builder()
                .quantity(45)
                .category("Cooked Meal")
                .daysUntilExpiry(1.2)
                .fridgeId(1L)
                .build();

        AiWasteResponseDto response = aiService.predictWasteRisk(request);
        assertNotNull(response);
        System.out.println("=== Waste Prediction Response ===");
        System.out.println("Waste Risk: " + response.getWasteRisk());
        System.out.println("Risk Score: " + response.getRiskScore());
        System.out.println("Model Type: " + response.getModelType());

        assertNotNull(response.getWasteRisk());
        assertFalse(response.getModelType().contains("Spring Boot Prototype Fallback"),
                "Waste prediction should use FastAPI service result, not fallback!");
    }

    @Test
    public void testFridgeRecommendationCallsFastApi() {
        Map<String, Object> request = Map.of(
                "category", "Cooked Meal",
                "quantity", 30,
                "expiryHours", 24
        );

        Map<String, Object> response = aiService.getFridgeRecommendations(request);
        assertNotNull(response);
        System.out.println("=== Fridge Recommendation Response ===");
        System.out.println("Priority Fridge: " + response.get("priorityFridge"));
        System.out.println("Explanation: " + response.get("explanation"));
        System.out.println("Recommended Priority: " + response.get("recommendedPriority"));

        assertNotNull(response.get("priorityFridge"));
        assertTrue(response.containsKey("explanation"), "Recommendation should contain explanation from FastAPI!");
    }

    @Test
    public void testFreshnessAnalysisCallsFastApi() throws Exception {
        java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(50, 50, java.awt.image.BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g = img.createGraphics();
        g.setColor(java.awt.Color.GREEN);
        g.fillRect(0, 0, 50, 50);
        g.dispose();

        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(img, "jpg", baos);
        byte[] validJpegBytes = baos.toByteArray();

        MockMultipartFile mockFile = new MockMultipartFile("image", "test_food.jpg", "image/jpeg", validJpegBytes);

        AiFreshnessResponseDto response = aiService.analyzeFreshness(mockFile);
        assertNotNull(response);
        System.out.println("=== Freshness Analysis Response ===");
        System.out.println("Label: " + response.getLabel());
        System.out.println("Confidence: " + response.getConfidence());
        System.out.println("Details: " + response.getDetails());

        assertNotNull(response.getLabel());
        assertTrue(response.getDetails().contains("OpenCV HSV color analysis"),
                "Freshness analysis should use FastAPI OpenCV result!");
    }
}
