import { FC } from 'react';
import { Billboard, Text } from '@react-three/drei';

interface PlayerNameProps {
  name: string;
}

const PlayerName: FC<PlayerNameProps> = ({ name }) => {
  return (
    <Billboard position={[0, 12, 0]}>
      <Text fontSize={1.5} color="white">
        {name}
      </Text>
    </Billboard>
  );
};

export default PlayerName;
