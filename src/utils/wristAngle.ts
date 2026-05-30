/**
 * Wrist angle calculation from MediaPipe hand landmarks
 * Landmarks: 0=wrist, 5=index_mcp, 9=middle_mcp, 12=middle_tip
 * Flexion/Extension: angle between forearm (wrist→mcp) and hand (wrist→fingers)
 */
export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

/** Calculate angle between wrist-forearm and wrist-hand vectors (degrees) */
export function calculateWristAngle(landmarks: HandLandmark[]): number | null {
  if (landmarks.length < 13) return null;

  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const middleTip = landmarks[12];

  // Forearm direction: wrist → midpoint of MCPs (proxy for forearm)
  const forearmMidX = (indexMcp.x + middleMcp.x) / 2;
  const forearmMidY = (indexMcp.y + middleMcp.y) / 2;
  const forearmDx = forearmMidX - wrist.x;
  const forearmDy = forearmMidY - wrist.y;

  // Hand direction: wrist → middle finger tip
  const handDx = middleTip.x - wrist.x;
  const handDy = middleTip.y - wrist.y;

  const dot = forearmDx * handDx + forearmDy * handDy;
  const mag1 = Math.sqrt(forearmDx * forearmDx + forearmDy * forearmDy);
  const mag2 = Math.sqrt(handDx * handDx + handDy * handDy);
  if (mag1 < 1e-6 || mag2 < 1e-6) return null;

  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  const radians = Math.acos(cosAngle);
  return Math.round((radians * 180) / Math.PI);
}
