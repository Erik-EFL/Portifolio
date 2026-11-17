import {
  GrayscaleInterface,
  ThemeChangeInterface
} from '@/@types/design-system/colors'

export const grayscale: GrayscaleInterface = {
  10: '#0C0C0C',
  20: '#333',
  30: '#3D3D3D',
  40: '#555',
  50: '#6B6B6B',
  60: '#858585',
  70: '#9A9A9A',
  80: '#B8B8B8',
  90: '#D6D6D6',
  100: '#F2F2F2',
  110: '#FBFBFB'
}

export const blackPalette: ThemeChangeInterface = {
  color: {
    dark: {
      10: '#1e1e1f',
      20: '#2e2e2f',
      30: '#3e3e3f',
      40: '#4e4e4f',
      50: '#5e5e5f',
      60: '#6e6e6f',
      70: '#7e7e7f',
      80: '#8e8e8f',
      90: '#9e9e9f',
      100: '#aeaeaf',
      110: '#fbfbfb'
    },
    light: {
      10: '#fbfbfb',
      20: '#f2f2f2',
      30: '#d6d6d6',
      40: '#b8b8b8',
      50: '#9a9a9a',
      60: '#858585',
      70: '#6b6b6b',
      80: '#555',
      90: '#3d3d3d',
      100: '#333',
      110: '#0c0c0c'
    }
  }
}

export const goldenPalette: ThemeChangeInterface = {
  color: {
    dark: {
      10: '#fffae6',
      20: '#ffefb1',
      30: '#ffe78c',
      40: '#ffdc57',
      50: '#ffd536',
      60: '#ffcb04',
      70: '#e8b904',
      80: '#b59003',
      90: '#8c7002',
      100: '#6b5502',
      110: '#4e4e4f'
    },
    light: {
      10: '#4e4e4f',
      20: '#6b5502',
      30: '#8c7002',
      40: '#b59003',
      50: '#e8b904',
      60: '#ffcb04',
      70: '#ffd536',
      80: '#ffdc57',
      90: '#ffe78c',
      100: '#ffefb1',
      110: '#fffae6'
    }
  }
}

export const bluePalette: ThemeChangeInterface = {
  color: {
    dark: {
      10: '#e6f4ff',
      20: '#b3d9ff',
      30: '#80bdff',
      40: '#4da2ff',
      50: '#1a87ff',
      60: '#006ed1',
      70: '#005bb3',
      80: '#004593',
      90: '#003073',
      100: '#001c54',
      110: '#000735'
    },
    light: {
      10: '#000735',
      20: '#001c54',
      30: '#003073',
      40: '#004593',
      50: '#005bb3',
      60: '#006ed1',
      70: '#1a87ff',
      80: '#4da2ff',
      90: '#80bdff',
      100: '#b3d9ff',
      110: '#e6f4ff'
    }
  }
}

export const purplePalette: ThemeChangeInterface = {
  color: {
    dark: {
      10: '#f7f4f9',
      20: '#ebe3ef',
      30: '#d8c7df',
      40: '#c3a8cc',
      50: '#af89ba',
      60: '#9b6aa8',
      70: '#81558b',
      80: '#67426d',
      90: '#4d3050',
      100: '#331e34',
      110: '#19080e'
    },
    light: {
      10: '#19080e',
      20: '#331e34',
      30: '#4d3050',
      40: '#67426d',
      50: '#81558b',
      60: '#9b6aa8',
      70: '#af89ba',
      80: '#c3a8cc',
      90: '#d8c7df',
      100: '#ebe3ef',
      110: '#f7f4f9'
    }
  }
}

export const greenPalette: ThemeChangeInterface = {
  color: {
    dark: {
      10: '#f2f8f4',
      20: '#e1efe7',
      30: '#c7e1ce',
      40: '#aacdb1',
      50: '#8cbb94',
      60: '#6fa978',
      70: '#558a5f',
      80: '#3e6c47',
      90: '#284e31',
      100: '#112f1b',
      110: '#001505'
    },
    light: {
      10: '#001505',
      20: '#112f1b',
      30: '#284e31',
      40: '#3e6c47',
      50: '#558a5f',
      60: '#6fa978',
      70: '#8cbb94',
      80: '#aacdb1',
      90: '#c7e1ce',
      100: '#e1efe7',
      110: '#f2f8f4'
    }
  }
}

export const module = {
  dark: {
    1: {
      color: {
        1: blackPalette.color['dark'],
        2: goldenPalette.color['dark']
      }
    },
    2: {
      color: {
        1: bluePalette.color['dark'],
        2: greenPalette.color['dark'],
        3: purplePalette.color['dark']
      }
    }
  },
  light: {
    1: {
      color: {
        1: blackPalette.color['light'],
        2: goldenPalette.color['light']
      }
    },
    2: {
      color: {
        1: bluePalette.color['light'],
        2: greenPalette.color['light'],
        3: purplePalette.color['light']
      }
    }
  }
}
