/**
Calculates weighted quality score for each enabled adgroup
Once calculated script adds row to Google Sheet

This allows the tracking of quality score changes overtime

Script is intended to run daily
*/

function main() {
    
  var adgroupsIterator = AdWordsApp.adGroups()
      .withCondition("CampaignStatus = ENABLED")
      .withCondition("Status = ENABLED")
      .withCondition("Impressions > 100")
      .orderBy("Impressions")
      .forDateRange("LAST_30_DAYS")
      .get();
  
  while (adgroupsIterator.hasNext()) {
    
    var totalImpressionsAnalyzed = 0;
    var totalQualityScoreAnalyzed = 0;
    
    var adgroup = adgroupsIterator.next();
    var adgroupName = adgroup.getName();
    var campaignName = adgroup.getCampaign().getName();
    
    var adgroupStats = adgroup.getStatsFor("LAST_30_DAYS");
    
    var keywordIterator = adgroup.keywords()
    .withCondition("Status = ENABLED")
    .withCondition("CampaignStatus = ENABLED")
    .withCondition("AdGroupStatus = ENABLED")
    .orderBy("Impressions")
    .forDateRange("LAST_30_DAYS")
    .withLimit(100000)
    .get();
    
    while (keywordIterator.hasNext()) {
      var keyword = keywordIterator.next();
      var qualityScore = keyword.getQualityScore();
      var keywordStats = keyword.getStatsFor("LAST_30_DAYS");
      var impressions = keywordStats.getImpressions();
      var qualityScoreContribution = qualityScore * impressions;
      totalQualityScoreAnalyzed = totalQualityScoreAnalyzed + qualityScoreContribution;
      totalImpressionsAnalyzed = totalImpressionsAnalyzed + impressions;
    }
    
    var adgroupQualityScore = totalQualityScoreAnalyzed / totalImpressionsAnalyzed;
  
    Logger.log(adgroupName + " QS: " + adgroupQualityScore);
  
    var date = new Date();
    var spreadsheetUrl = "https://docs.google.com/a/bnsly.com/spreadsheets/d/1hW8Rdb6Z-2Q8_HzMAUeZ7ozOE16a-43OfG3yMwXI_wI/edit?usp=sharing";
    var qualityScoreSheet = SpreadsheetApp.openByUrl(spreadsheetUrl).getActiveSheet();
    qualityScoreSheet.appendRow([date, adgroupName, campaignName, 
                                 adgroupStats.getImpressions(),adgroupStats.getClicks(),adgroupStats.getConvertedClicks(),
                                 adgroupQualityScore]);
  
  }
  
}