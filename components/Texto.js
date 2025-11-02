import { Text } from 'react-native';

export default function Texto({ style, ...props }) {
  return (
    <Text {...props} style={[{ fontFamily: 'Rubik' }, style]}>
      {props.children}
    </Text>
  );
}
