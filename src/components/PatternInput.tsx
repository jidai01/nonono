import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, GestureResponderEvent, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../types/theme';

const GRID_SIZE = 3;
const DOT_SIZE = 28;
const DOT_SPACING = 72;
const PADDING = 36;

interface PatternInputProps {
  onComplete: (pattern: string) => void;
  error?: boolean;
}

interface Point {
  x: number;
  y: number;
  index: number;
}

export default function PatternInput({ onComplete, error }: PatternInputProps) {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const scaleAnim = useRef<Animated.Value[]>(Array.from({ length: 9 }, () => new Animated.Value(1)));
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
      if (dist < minDist && dist < DOT_SIZE * 2.5) {
        minDist = dist;
        nearest = point;
      }
    }
    return nearest;
  }, [getDotPositions]);

  const animateDot = (index: number, toValue: number) => {
    Animated.spring(scaleAnim.current[index], {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const dot = findNearestDot(locationX, locationY);
    if (dot) {
      setIsDragging(true);
      setSelectedDots([dot.index]);
      animateDot(dot.index, 1.3);
    }
  }, [findNearestDot]);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (!isDragging) return;
    const { locationX, locationY } = event.nativeEvent;
    const dot = findNearestDot(locationX, locationY);

    if (dot && !selectedDots.includes(dot.index)) {
      setSelectedDots(prev => [...prev, dot.index]);
      animateDot(dot.index, 1.3);
    }
  }, [isDragging, selectedDots, findNearestDot]);

  const handleTouchEnd = useCallback(() => {
    if (selectedDots.length >= 4) {
      onComplete(selectedDots.join(','));
    }
    selectedDots.forEach(i => animateDot(i, 1));
    setIsDragging(false);
    setSelectedDots([]);
  }, [selectedDots, onComplete]);

  const dots = getDotPositions();

  const renderLines = () => {
    if (selectedDots.length < 2) return null;

    const lines: React.ReactNode[] = [];
    for (let i = 0; i < selectedDots.length - 1; i++) {
      const fromIdx = selectedDots[i];
      const toIdx = selectedDots[i + 1];
      const from = dots[fromIdx];
      const to = dots[toIdx];

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      lines.push(
        <View
          key={`line-${i}`}
          style={[
            styles.line,
            {
              width: length,
              left: from.x,
              top: from.y - 2,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      );
    }
    return lines;
  };

  return (
    <View style={styles.wrapper}>
      <View
        ref={containerRef}
        style={[styles.container, error && styles.containerError]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        {renderLines()}

        {dots.map((dot) => {
          const isSelected = selectedDots.includes(dot.index);
          return (
            <Animated.View
              key={dot.index}
              style={[
                styles.dotOuter,
                {
                  left: dot.x - (DOT_SIZE + 16) / 2,
                  top: dot.y - (DOT_SIZE + 16) / 2,
                  transform: [{ scale: scaleAnim.current[dot.index] }],
                },
                isSelected && styles.dotOuterSelected,
              ]}
            >
              <View style={[styles.dot, isSelected && styles.dotSelected]}>
                {isSelected && <Ionicons name="checkmark" size={14} color={Colors.textInverse} />}
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.dotCountRow}>
        <Ionicons name="finger-print" size={16} color={Colors.textTertiary} />
        <Text style={styles.dotCountText}>
          {selectedDots.length > 0 ? `${selectedDots.length} dots selected` : 'Connect at least 4 dots'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    width: GRID_SIZE * DOT_SPACING + PADDING * 2,
    height: GRID_SIZE * DOT_SPACING + PADDING * 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.medium,
  },
  containerError: {
    borderColor: Colors.error,
  },
  line: {
    position: 'absolute',
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    opacity: 0.6,
    transformOrigin: 'left',
  },
  dotOuter: {
    width: DOT_SIZE + 16,
    height: DOT_SIZE + 16,
    borderRadius: (DOT_SIZE + 16) / 2,
    backgroundColor: Colors.background,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotOuterSelected: {
    backgroundColor: Colors.primaryLight + '30',
    borderColor: Colors.primary + '50',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotSelected: {
    backgroundColor: Colors.primary,
  },
  dotCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  dotCountText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
});
