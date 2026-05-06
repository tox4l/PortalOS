/**
 * Value Object base class for PortalOS DDD architecture.
 *
 * Value objects are immutable and compared by structural equality.
 * They have no identity -- two VOs with the same properties are equal.
 */
export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze({ ...props }) as T;
  }

  /**
   * Structural equality check.
   * Two value objects are equal if all their properties are equal.
   */
  public equals(other: ValueObject<T>): boolean {
    if (other == null) return false;
    if (this === other) return true;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  /**
   * Return a read-only view of internal properties.
   */
  public get value(): Readonly<T> {
    return this.props;
  }
}
