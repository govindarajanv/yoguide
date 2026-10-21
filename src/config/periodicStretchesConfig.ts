import rawConfig from '../../config/periodicStretches.yaml?raw'
import { parseAppConfig, type AppConfig } from './appConfig'

export const PERIODIC_STRETCHES_CONFIG: AppConfig = parseAppConfig(rawConfig)
