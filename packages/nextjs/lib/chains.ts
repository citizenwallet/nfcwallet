import { base, baseSepolia, celo, celoAlfajores, gnosis, gnosisChiado, polygon, polygonMumbai } from "viem/chains";

interface ChainMap {
  [key: number]: any;
}

const chains: ChainMap = {
  137: polygon,
  80001: polygonMumbai,
  100: gnosis,
  10200: gnosisChiado,
  8453: base,
  84532: baseSepolia,
  42220: celo,
  44787: celoAlfajores,
};

export default chains;
