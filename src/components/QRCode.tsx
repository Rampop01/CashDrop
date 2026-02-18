"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  return (
    <div className="bg-white rounded-2xl p-4 inline-flex">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
