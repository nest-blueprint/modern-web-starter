import { Mentor } from '../../mentor';
import { Type as TrainingType } from '../type';

export class Pricing {
  mentor_id: string;
  daily_rate_amount: number | null;
  training_rate: number | null;
  training_type: TrainingType;
  mentor?: Mentor;
}
