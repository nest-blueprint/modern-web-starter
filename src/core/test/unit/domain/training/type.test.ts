import { Type as TrainingType } from '../../../../src/domain/training/type';
describe('[Core/Domain] Training Type', () => {
  test('Initialization with incorrect values', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new TrainingType('REMOTE')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new TrainingType('')).toThrow();
  });

  test('Initialization with correct values', () => {
    expect(new TrainingType('remote')).toBeDefined();
    expect(new TrainingType('face_to_face')).toBeDefined();
    expect(new TrainingType(TrainingType.Remote)).toBeDefined();
    expect(new TrainingType(TrainingType.FaceToFace)).toBeDefined();
  });

  test('equals()', () => {
    const remote1 = new TrainingType(TrainingType.Remote);
    const remote2 = new TrainingType(TrainingType.Remote);
    const faceToFace = new TrainingType(TrainingType.FaceToFace);

    //Equality with itself
    expect(remote1.equals(remote1)).toBeTruthy();

    // Commutativity
    expect(remote1.equals(remote2)).toBeTruthy();
    expect(remote2.equals(remote1)).toBeTruthy();

    // Equality
    expect(remote1.equals(remote2)).toBeTruthy();

    //Equality with others values
    expect(remote2.equals('REMOTE')).toBeFalsy();
    expect(remote2.equals([remote2])).toBeFalsy();
    expect(faceToFace.equals('')).toBeFalsy();
    expect(faceToFace.equals({})).toBeFalsy();
    expect(faceToFace.equals(123)).toBeFalsy();
  });

  test('get value()', () => {
    const remote = new TrainingType(TrainingType.Remote);
    expect(remote.value).toEqual(TrainingType.Remote);
  });

  test('fromString()', () => {
    expect(TrainingType.fromString(TrainingType.Remote)).toEqual(new TrainingType(TrainingType.Remote));
    expect(TrainingType.fromString(TrainingType.FaceToFace)).toEqual(new TrainingType(TrainingType.FaceToFace));
  });

  test('values()', () => {
    expect(TrainingType.values().includes(TrainingType.Remote)).toBeTruthy();
    expect(TrainingType.values().includes(TrainingType.FaceToFace)).toBeTruthy();
    expect(TrainingType.values().length).toBe(2);
  });
});
