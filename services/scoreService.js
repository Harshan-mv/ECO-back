export const calculateGreenScore = ({ billType, purchaseMode, ecoCertification, totalAmount }) => {
    let score = 0;
  
    // Eco Certification Weightage
    const certPoints = {
      "None": 0,
      "USDA Organic": 10,
      "Energy Star": 15,
      "Fair Trade": 8,
    };
    score += certPoints[ecoCertification] || 0;
  
    // Purchase Mode Weightage
    const modePoints = {
      "Local Store": 10,
      "Online": 5,
      "Offline": 5,
    };
    score += modePoints[purchaseMode] || 0;
  
    // Total Amount Weightage
    if (totalAmount > 100) score += 5;
  
    return score;
  };
  
  export const assignBadge = (score) => {
    if (score > 100) return "♻️ Eco Warrior";
    if (score > 50) return "🌎 Sustainability Champion";
    if (score > 20) return "🌿 Green Enthusiast";
    return "🌱 Eco Beginner";
  };
  
  