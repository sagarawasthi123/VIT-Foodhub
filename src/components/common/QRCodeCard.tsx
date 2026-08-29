import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCardProps {
  value: string;
  size?: number;
}

export function QRCodeCard({ value, size = 180 }: QRCodeCardProps) {
  return (
    <div className="inline-flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
      <QRCodeSVG value={value} size={size} level="M" />
      <p className="text-sm font-medium text-muted-foreground">Scan to verify token</p>
    </div>
  );
}
