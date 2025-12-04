import { hsl } from 'd3-color';

// Color generation based on level
export function getHslStringForLevel(level) {
    const hue = ((level - 1) * 40) % 360;
    return `hsl(${hue}, 100%, 60%)`;
}

// Robust hit detection for circular arcs
export function isAngleInArc(angleToCheck, arcStart, arcSize) {
    const twoPi = Math.PI * 2;
    const normAngle = (angleToCheck % twoPi + twoPi) % twoPi;
    const normArcStart = (arcStart % twoPi + twoPi) % twoPi;
    
    const normArcEnd = (normArcStart + arcSize) % twoPi;

    if (normArcStart < normArcEnd) {
        return normAngle >= normArcStart && normAngle <= normArcEnd;
    } else {
        return normAngle >= normArcStart || normAngle <= normArcEnd;
    }
}

export function getComputedColors() {
    const computedStyles = getComputedStyle(document.documentElement);
    return {
        secondary: computedStyles.getPropertyValue('--secondary-color'),
        success: computedStyles.getPropertyValue('--success-color'),
        fail: computedStyles.getPropertyValue('--fail-color')
    };
}