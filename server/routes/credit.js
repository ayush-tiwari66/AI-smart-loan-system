const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const { calculateCreditScore } = require('../utils/creditEngine');

const router = express.Router();

// Calculate credit score (standalone)
router.post('/calculate', auth, async (req, res) => {
  try {
    const creditResult = calculateCreditScore(req.body);

    // Save score
    await supabase.from('credit_scores').insert([{
      user_id: req.user.id,
      score: creditResult.score,
      factors: creditResult.factors,
      risk_level: creditResult.riskLevel
    }]);

    res.json(creditResult);
  } catch (error) {
    console.error('Credit calc error:', error);
    res.status(500).json({ error: 'Credit score calculation failed.' });
  }
});

// Get user's latest credit score
router.get('/my-score', auth, async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({
      latest: scores?.[0] || null,
      history: scores || []
    });
  } catch (error) {
    console.error('Get score error:', error);
    res.status(500).json({ error: 'Failed to fetch credit score.' });
  }
});

module.exports = router;
