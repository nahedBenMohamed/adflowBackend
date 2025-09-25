import { UseInterceptors } from '@nestjs/common';
import { TransformToDtoInterceptor } from '../interceptors';

export const TransformToDto = () => UseInterceptors(TransformToDtoInterceptor);
