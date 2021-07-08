function toDoubleHex(num) {
    if (num <= 0)   { return "00"; }
    if (num >= 255) { return "ff"; }
    return (num < 16 ? '0' : '') + (num | 0).toString(16);
}
function toColor(r, g, b) {
	return `#${toDoubleHex(255 * r)}${toDoubleHex(255 * g)}${toDoubleHex(255 * b)}`;
}
