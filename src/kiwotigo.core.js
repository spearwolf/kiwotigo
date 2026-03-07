import {createContinent} from './kiwotigo-wasm-bridge.js';
import {findAndConnectAllIslands} from './kiwotigo-unite-islands.js';
import {DefaultConfig, convertToIntermediateContinentalFormat} from './kiwotigo-postprocess.js';

export {DefaultConfig};

export const buildContinent = async (data, originDataInput, onProgress) => {
  let config;
  let result;

  if (originDataInput) {
    const parsedOriginData = typeof originDataInput === 'string' ? JSON.parse(originDataInput) : originDataInput;
    config = {...DefaultConfig, ...parsedOriginData.config, ...data};
    result = parsedOriginData;
  } else {
    config = {...DefaultConfig, ...data};
    result = await createContinent(config, (progress) => onProgress(progress * 0.7));
  }

  onProgress(0.7);

  const originData = JSON.stringify({
    config,
    continent: result.continent,
  });

  let continent = convertToIntermediateContinentalFormat(config, result.continent);

  onProgress(0.8);

  continent = findAndConnectAllIslands(continent, config);

  return {
    config,
    continent,
    originData,
  };
};
