'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useVehicleStore } from '@/store/vehicle';

export default function FitmentBadge({ productId }: { productId: string }) {
  const { vehicle } = useVehicleStore();
  const [fitment, setFitment] = useState<any>(null);

  useEffect(() => {
    if (!vehicle.vehicleId && !vehicle.make) return;
    const params = new URLSearchParams();
    if (vehicle.vehicleId) params.set('vehicleId', vehicle.vehicleId);
    if (vehicle.make) params.set('make', vehicle.make);
    if (vehicle.model) params.set('model', vehicle.model);
    if (vehicle.year) params.set('year', vehicle.year);
    api.get(`/api/products/${productId}/fitment?${params}`)
      .then(r => { if (r.data.fitment) setFitment(r.data.fitment); })
      .catch(() => {});
  }, [productId, vehicle.vehicleId, vehicle.make]);

  if (!fitment) return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: fitment.color + '15',
      border: '1px solid ' + fitment.color + '40',
      borderRadius: '8px', padding: '6px 12px',
      fontSize: '13px', fontWeight: 600, color: fitment.color,
    }}>
      <span>{fitment.label}</span>
      <span style={{
        background: fitment.color, color: '#fff',
        borderRadius: '6px', padding: '1px 6px', fontSize: '11px'
      }}>{fitment.score}%</span>
    </div>
  );
}
