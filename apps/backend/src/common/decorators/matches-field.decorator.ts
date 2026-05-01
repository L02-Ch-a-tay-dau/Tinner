import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function MatchesField(targetField: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "matchesField",
      target: object.constructor,
      propertyName,
      constraints: [targetField],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [field] = args.constraints as string[];
          const relatedValue = (args.object as Record<string, unknown>)[field];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [field] = args.constraints as string[];
          return `${args.property} must match ${field}`;
        },
      },
    });
  };
}
