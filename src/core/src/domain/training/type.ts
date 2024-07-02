import assert from 'assert';

export enum TrainingTypeEnum {
  Remote = 'remote',
  FaceToFace = 'face_to_face',
}

const trainingTypeEnumObject = {
  Remote: 'remote',
  FaceToFace: 'face_to_face',
} as const;

type Keys = keyof typeof trainingTypeEnumObject;
export type TrainingTypeEnumValues = typeof trainingTypeEnumObject[Keys];

export class Type {
  public static Remote: TrainingTypeEnumValues = 'remote';
  public static FaceToFace: TrainingTypeEnumValues = 'face_to_face';

  constructor(private readonly _value: TrainingTypeEnumValues) {
    assert(
      Object.values(trainingTypeEnumObject).includes(_value),
      `Bad Enum<TrainingType> initialization. Value provided : ${_value} - 
        Allowed values : ${Object.values(TrainingTypeEnum).toString()}`,
    );
    Object.freeze(this);
  }

  get value() {
    return this._value;
  }

  static fromString(value: string): Type {
    return new Type(value as TrainingTypeEnumValues);
  }

  equals(trainingType: unknown): boolean {
    if (!(trainingType instanceof Type)) return false;
    return trainingType.value.valueOf() === this.value.valueOf();
  }

  static values(): TrainingTypeEnumValues[] {
    return Object.values(trainingTypeEnumObject);
  }
}
