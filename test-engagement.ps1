# ChatGPT-Level Engagement System Test
# Testing all conversation intelligence features

Write-Host "🚀 Testing ChatGPT-Level Engagement System" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

$baseUrl = "http://localhost:3001"
$testScenarios = @(
    @{
        Name = "🎉 Excited User Test"
        Message = "I'm so excited about your chatbot features! This looks amazing!"
        ExpectedFeatures = @("personality", "enthusiasm", "follow-up")
    },
    @{
        Name = "🚨 Frustrated User Test" 
        Message = "This is confusing, I can't figure out your pricing. Help!"
        ExpectedFeatures = @("empathy", "support", "solution")
    },
    @{
        Name = "⚡ Urgent Business Test"
        Message = "I need to set this up ASAP for a client demo tomorrow"
        ExpectedFeatures = @("urgency", "direct", "action")
    },
    @{
        Name = "🤔 Curious Technical Test"
        Message = "How exactly does the AI training work? What's the underlying architecture?"
        ExpectedFeatures = @("detailed", "technical", "curious")
    },
    @{
        Name = "👋 Casual Greeting Test"
        Message = "Hey, what can your bot do?"
        ExpectedFeatures = @("friendly", "welcoming", "engaging")
    }
)

$totalTests = $testScenarios.Count
$passedTests = 0

foreach ($scenario in $testScenarios) {
    Write-Host "`n🧪 Testing: $($scenario.Name)" -ForegroundColor Yellow
    Write-Host "📝 Message: `"$($scenario.Message)`"" -ForegroundColor Gray
    
    try {
        $body = @{
            botId = "demo"
            messages = @(
                @{
                    role = "user"
                    content = $scenario.Message
                }
            )
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 30
        
        if ($response) {
            Write-Host "✅ Response received!" -ForegroundColor Green
            
            # Convert response to string if it's an object
            $responseText = if ($response -is [string]) { $response } else { $response | ConvertTo-Json }
            
            Write-Host "📄 Response length: $($responseText.Length) characters" -ForegroundColor Cyan
            Write-Host "💬 Sample: `"$($responseText.Substring(0, [Math]::Min(100, $responseText.Length)))...`"" -ForegroundColor White
            
            # Analyze engagement features
            $engagementChecks = @{
                "Has Personality" = $responseText -match "(?i)(I'm|I'd|really|amazing|exciting|interesting|love|fantastic|wonderful)"
                "Shows Emotion" = $responseText -match "(?i)(excited|enthusiasm|great|awesome|amazing|fantastic|wonderful|understand|feel)"
                "Has Questions" = $responseText -match "\?"
                "Substantial Content" = $responseText.Length -gt 50
                "Avoids Robot Speech" = -not ($responseText -match "(?i)(I am an AI|I am a chatbot|I don't have|I cannot)")
                "Engaging Tone" = $responseText -match "(?i)(let's|how about|what about|would you|could you|might you)"
            }
            
            Write-Host "`n🔍 Engagement Analysis:" -ForegroundColor Magenta
            $score = 0
            foreach ($check in $engagementChecks.GetEnumerator()) {
                $icon = if ($check.Value) { "✅" } else { "❌" }
                $color = if ($check.Value) { "Green" } else { "Red" }
                Write-Host "  $icon $($check.Key): $($check.Value)" -ForegroundColor $color
                if ($check.Value) { $score++ }
            }
            
            Write-Host "`n📊 Engagement Score: $score/6" -ForegroundColor Cyan
            
            if ($score -ge 5) {
                Write-Host "🎉 EXCELLENT! ChatGPT-level engagement detected! 🚀" -ForegroundColor Green
                $passedTests++
            } elseif ($score -ge 4) {
                Write-Host "✅ GOOD! Strong engagement features! 💪" -ForegroundColor Yellow
                $passedTests++
            } elseif ($score -ge 3) {
                Write-Host "⚠️ MODERATE engagement. Room for improvement." -ForegroundColor Yellow
            } else {
                Write-Host "❌ LOW engagement. Needs attention." -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ No response received" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "📋 Full error: $($_ | Out-String)" -ForegroundColor DarkRed
    }
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
Write-Host "🏆 FINAL RESULTS: $passedTests/$totalTests tests passed" -ForegroundColor Cyan
Write-Host "📊 Success Rate: $([Math]::Round(($passedTests / $totalTests) * 100, 1))%" -ForegroundColor Cyan

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ALL TESTS PASSED! ChatGPT-level engagement system is PERFECT! 🚀" -ForegroundColor Green
} elseif ($passedTests -ge ($totalTests * 0.8)) {
    Write-Host "✅ Most tests passed! System shows STRONG engagement capabilities! 💪" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ Some tests failed. System may need improvements." -ForegroundColor Red
}

Write-Host "`n🌐 Test the interactive system at: http://localhost:3001/test-engagement-system.html" -ForegroundColor Blue