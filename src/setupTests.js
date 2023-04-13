// setupTests.js

import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';

global.render = render;
global.screen = screen;
