export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'primary-1',
    light: '#66A3FE',
    main: '#1882FD',
    dark: '#1266C7'
  },
  {
    name: 'primary-2',
    light: '#4A90E2',
    main: '#2E5BBA',
    dark: '#1E3F7A'
  },
  {
    name: 'primary-3',
    light: '#FFB366',
    main: '#FF8A33',
    dark: '#CC5F1A'
  },
  {
    name: 'primary-4',
    light: '#4ECDC4',
    main: '#26C6DA',
    dark: '#1A8F9A'
  },
  {
    name: 'primary-5',
    light: '#A855F7',
    main: '#8B5CF6',
    dark: '#6D28D9'
  }
]

export default primaryColorConfig
