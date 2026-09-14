package com.communityfridge.service;

import com.communityfridge.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface AiService {
    AiDemandResponseDto predictDemand(AiDemandRequestDto request);
    AiWasteResponseDto predictWasteRisk(AiWasteRequestDto request);
    Map<String, Object> getFridgeRecommendations(Map<String, Object> request);
    AiFreshnessResponseDto analyzeFreshness(MultipartFile image);
}
