/**
Calculates weighted quality score for each enabled campaign
Once calculated script adds row to Google Sheet

This allows the tracking of quality score changes overtime

Script is intended to run daily
*/

function main() {
    
  var campaignIterator = AdWordsApp.campaigns()
      .withCondition("Status = ENABLED")
      .get();
  
  while (campaignIterator.hasNext()) {
    
    var totalImpressionsAnalyzed = 0;
    var totalQualityScoreAnalyzed = 0;
    
    var campaign = campaignIterator.next();
    var campaignName = campaign.getName();
    
    var keywordIterator = campaign.keywords()
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
    
    var campaignQualityScore = totalQualityScoreAnalyzed / totalImpressionsAnalyzed;
  
    Logger.log(campaignName + " QS: " + campaignQualityScore);
  
    var date = new Date();
    var spreadsheetUrl = "GOOGLE_SHEETS_SHARE_URL";
    var qualityScoreSheet = SpreadsheetApp.openByUrl(spreadsheetUrl).getActiveSheet();
    qualityScoreSheet.appendRow([date, campaignName, campaignQualityScore]);
  
  }
  
}