import rawConfig from '../../config/chairYoga.yaml?raw'
import { parseAppConfig, type AppConfig } from './appConfig'

export const CHAIR_YOGA_CONFIG: AppConfig = parseAppConfig(rawConfig)
