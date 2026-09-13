import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, GestureResponderEvent, Dimensions } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../types/theme';

const GRID_SIZE = 3;
const DOT_SIZE = 24;
const DOT_SPACING = 60;
const PADDING = 40;

interface PatternInputProps {
  onComplete: (pattern: string) => void;
}

interface Point {
  x: number;
  y: number;
  index: number;
}

export default function PatternInput({ onComplete }: PatternInputProps) {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<View>(null);

  const getDotPositions = useCallback((): Point[] => {
    const points: Point[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        points.push({
          x: PADDING + col * DOT_SPACING + DOT_SIZE / 2,
          y: PADDING + row * DOT_SPACING + DOT_SIZE / 2,
          index: row * GRID_SIZE + col,
        });
      }
    }
    return points;
  }, []);

  const findNearestDot = useCallback((x: number, y: number): Point | null => {
    const points = getDotPositions();
    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const point of points) {
      const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      if (dist < minDist && dist < DOT_SIZE * 2) {
        minDist = dist;
        nearest = point;
      }
    }
    return nearest;
  }, [getDotPositions]);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const dot = findNearestDot(locationX, locationY);
    if (dot) {
      setIsDragging(true);
      setSelectedDots([dot.index]);
      setCurrentPoint({ x: dot.x, y: dot.y });
    }
  }, [findNearestDot]);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (!isDragging) return;
    const { locationX, locationY } = event.nativeEvent;
    const dot = findNearestDot(locationX, locationY);

    if (dot && !selectedDots.includes(dot.index)) {
      setSelectedDots(prev => [...prev, dot.index]);
      setCurrentPoint({ x: dot.x, y: dot.y });
    }
  }, [isDragging, selectedDots, findNearestDot]);

  const handleTouchEnd = useCallback(() => {
    if (selectedDots.length >= 4) {
      onComplete(selectedDots.join(','));
    }
    setIsDragging(false);
    setCurrentPoint(null);
    setSelectedDots([]);
  }, [selectedDots, onComplete]);

  const dots = getDotPositions();

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
    >
      {dots.map((dot) => {
        const isSelected = selectedDots.includes(dot.index);
        return (
          <View
            key={dot.index}
            style={[
              styles.dot,
              {
                left: dot.x - DOT_SIZE / 2,
                top: dot.y - DOT_SIZE / 2,
              },
              isSelected && styles.dotSelected,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: GRID_SIZE * DOT_SPACING + PADDING * 2,
    height: GRID_SIZE * DOT_SPACING + PADDING * 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    position: 'relative',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.border,
    position: 'absolute',
  },
  dotSelected: {
    backgroundColor: Colors.primary,
  },
});
