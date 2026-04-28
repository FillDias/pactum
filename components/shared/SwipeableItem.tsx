import { useRef, ReactNode } from 'react'
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'

const DELETE_WIDTH = 80
const SWIPE_THRESHOLD = 40

type Props = {
  children: ReactNode
  onDelete: () => void
  disabled?: boolean
}

export default function SwipeableItem({ children, onDelete, disabled }: Props) {
  const translateX = useRef(new Animated.Value(0)).current

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !disabled && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),

      onPanResponderMove: (_, g) => {
        const x = Math.min(0, Math.max(-DELETE_WIDTH, g.dx))
        translateX.setValue(x)
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -DELETE_WIDTH,
            useNativeDriver: true,
          }).start()
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start()
        }
      },
    })
  ).current

  const close = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start()
  }

  const handleDelete = () => {
    close()
    onDelete()
  }

  if (Platform.OS === 'web') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>{children}</View>
        <TouchableOpacity
          onPress={onDelete}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.status.negative + '18',
            borderWidth: 1,
            borderColor: colors.status.negative + '33',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather name="trash-2" size={15} color={colors.status.negative} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: DELETE_WIDTH,
          backgroundColor: colors.status.negative,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 14,
        }}
      >
        <TouchableOpacity onPress={handleDelete} style={{ padding: 16 }}>
          <Feather name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  )
}
