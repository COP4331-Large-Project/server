class APIError extends Error {
  constructor(
    readonly title = 'Server Error',
    readonly description = 'An internal server error occurred',
    readonly status = 500,
    readonly instance: string | null = null,
  ) {
    super(title);
    this.title = title;
    this.description = description;
    this.status = status;
    this.instance = instance;
  }
}

export default APIError;
