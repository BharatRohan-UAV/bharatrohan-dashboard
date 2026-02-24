'use client';

import { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface FlightGraphsProps {
    batteryData: number[][] | null;
    altitudeData: number[][] | null;
    attitudeData: number[][] | null;
    vibrationData: number[][] | null;
    loading?: boolean;
}

type TabKey = 'battery' | 'altitude' | 'attitude' | 'vibrations';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'battery', label: 'Battery' },
    { key: 'altitude', label: 'Altitude' },
    { key: 'attitude', label: 'Attitude' },
    { key: 'vibrations', label: 'Vibrations' },
];

const TOOLTIP_STYLE = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8E0D4',
    borderRadius: '8px',
    fontSize: '12px',
};

function EmptyState({ label }: { label: string }) {
    return (
        <div style={{
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            backgroundColor: '#F8F6F1',
            borderRadius: '8px',
            fontSize: '13px',
        }}>
            No {label.toLowerCase()} data recorded in this log
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTime(value: any): string {
    const seconds = Number(value);
    if (isNaN(seconds)) return String(value);
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FlightGraphs({
    batteryData,
    altitudeData,
    attitudeData,
    vibrationData,
    loading,
}: FlightGraphsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('battery');

    const battery = useMemo(() =>
        (batteryData ?? []).map(([t, voltage, current, remaining]) => ({
            time: +t.toFixed(1),
            Voltage: +voltage.toFixed(2),
            Current: +current.toFixed(1),
            'Remaining %': +remaining.toFixed(1),
        })),
        [batteryData]
    );

    const altitude = useMemo(() =>
        (altitudeData ?? []).map(([t, alt, desAlt]) => ({
            time: +t.toFixed(1),
            Altitude: +alt.toFixed(1),
            'Desired Alt': +desAlt.toFixed(1),
        })),
        [altitudeData]
    );

    const attitude = useMemo(() =>
        (attitudeData ?? []).map(([t, roll, pitch, yaw]) => ({
            time: +t.toFixed(1),
            Roll: +roll.toFixed(1),
            Pitch: +pitch.toFixed(1),
            Yaw: +yaw.toFixed(1),
        })),
        [attitudeData]
    );

    const vibrations = useMemo(() =>
        (vibrationData ?? []).map(([t, vibeX, vibeY, vibeZ]) => ({
            time: +t.toFixed(1),
            VibeX: +vibeX.toFixed(2),
            VibeY: +vibeY.toFixed(2),
            VibeZ: +vibeZ.toFixed(2),
        })),
        [vibrationData]
    );

    if (loading) {
        return (
            <div style={{
                borderRadius: '12px',
                border: '1px solid #E8E0D4',
                overflow: 'hidden',
                marginTop: '12px',
            }}>
                <div style={{
                    padding: '10px 16px',
                    backgroundColor: '#F8F6F1',
                    borderBottom: '1px solid #E8E0D4',
                }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                        Flight Analysis
                    </span>
                </div>
                <div style={{
                    height: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B6B6B',
                    fontSize: '13px',
                }}>
                    Loading graph data...
                </div>
            </div>
        );
    }

    const noData = !batteryData && !altitudeData && !attitudeData && !vibrationData;
    if (noData) {
        return (
            <div style={{
                borderRadius: '12px',
                border: '1px solid #E8E0D4',
                overflow: 'hidden',
                marginTop: '12px',
            }}>
                <div style={{
                    padding: '10px 16px',
                    backgroundColor: '#F8F6F1',
                    borderBottom: '1px solid #E8E0D4',
                }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                        Flight Analysis
                    </span>
                </div>
                <div style={{
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '13px',
                }}>
                    No telemetry data available for this log
                </div>
            </div>
        );
    }

    return (
        <div style={{
            borderRadius: '12px',
            border: '1px solid #E8E0D4',
            overflow: 'hidden',
            marginTop: '12px',
        }}>
            {/* Header */}
            <div style={{
                padding: '10px 16px',
                backgroundColor: '#F8F6F1',
                borderBottom: '1px solid #E8E0D4',
            }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B4332' }}>
                    Flight Analysis
                </span>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #E8E0D4',
                backgroundColor: '#FDFCFA',
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1,
                            padding: '10px 8px',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '3px solid #D4A017' : '3px solid transparent',
                            backgroundColor: 'transparent',
                            color: activeTab === tab.key ? '#1B4332' : '#6B6B6B',
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Chart area */}
            <div style={{ padding: '16px 8px 8px' }}>
                {activeTab === 'battery' && (
                    battery.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={battery}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={formatTime}
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#999' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'V', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#2D6A4F' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'A / %', angle: 90, position: 'insideRight', fontSize: 10, fill: '#D4A017' }}
                                />
                                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatTime} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Line yAxisId="left" type="monotone" dataKey="Voltage" stroke="#2D6A4F" strokeWidth={1.5} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="Current" stroke="#D4A017" strokeWidth={1.5} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="Remaining %" stroke="#52B788" strokeWidth={1.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyState label="Battery" />
                )}

                {activeTab === 'altitude' && (
                    altitude.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={altitude}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={formatTime}
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#999' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'm', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#2D6A4F' }}
                                />
                                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatTime} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Line type="monotone" dataKey="Altitude" stroke="#2D6A4F" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="Desired Alt" stroke="#D4A017" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyState label="Altitude" />
                )}

                {activeTab === 'attitude' && (
                    attitude.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={attitude}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={formatTime}
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#999' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'deg', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#2D6A4F' }}
                                />
                                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatTime} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Line type="monotone" dataKey="Roll" stroke="#2D6A4F" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="Pitch" stroke="#D4A017" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="Yaw" stroke="#52B788" strokeWidth={1.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyState label="Attitude" />
                )}

                {activeTab === 'vibrations' && (
                    vibrations.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={vibrations}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={formatTime}
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#999' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'm/s/s', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#2D6A4F' }}
                                />
                                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatTime} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Line type="monotone" dataKey="VibeX" stroke="#2D6A4F" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="VibeY" stroke="#D4A017" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="VibeZ" stroke="#52B788" strokeWidth={1.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyState label="Vibrations" />
                )}
            </div>
        </div>
    );
}
