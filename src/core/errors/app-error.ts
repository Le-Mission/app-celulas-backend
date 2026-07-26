export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }

  static unauthenticated(message = "Autenticação necessária.") {
    return new AppError("UNAUTHENTICATED", message, 401);
  }

  static forbidden(message = "Você não possui permissão para esta operação.") {
    return new AppError("FORBIDDEN", message, 403);
  }

  static notFound(message = "Recurso não encontrado.") {
    return new AppError("NOT_FOUND", message, 404);
  }

  static validationError(message = "Dados inválidos.", details?: Record<string, unknown>) {
    return new AppError("VALIDATION_ERROR", message, 400, details);
  }

  static conflict(message = "Conflito com estado atual.") {
    return new AppError("CONFLICT", message, 409);
  }

  static planLimitReached(message = "Limite do plano atingido.") {
    return new AppError("PLAN_LIMIT_REACHED", message, 403);
  }

  static featureNotAvailable(message = "Recurso não disponível no plano atual.") {
    return new AppError("FEATURE_NOT_AVAILABLE", message, 403);
  }

  static subscriptionRequired(message = "Assinatura ativa necessária.") {
    return new AppError("SUBSCRIPTION_REQUIRED", message, 403);
  }

  static subscriptionPastDue(message = "Assinatura com pagamento atrasado.") {
    return new AppError("SUBSCRIPTION_PAST_DUE", message, 403);
  }

  static paymentProviderError(message = "Erro no provedor de pagamento.") {
    return new AppError("PAYMENT_PROVIDER_ERROR", message, 502);
  }

  static webhookSignatureInvalid(message = "Assinatura do webhook inválida.") {
    return new AppError("WEBHOOK_SIGNATURE_INVALID", message, 401);
  }

  static webhookAlreadyProcessed(message = "Webhook já processado.") {
    return new AppError("WEBHOOK_ALREADY_PROCESSED", message, 200);
  }

  static rateLimited(message = "Muitas requisições. Tente novamente mais tarde.") {
    return new AppError("RATE_LIMITED", message, 429);
  }

  static internal(message = "Erro interno do servidor.") {
    return new AppError("INTERNAL_ERROR", message, 500);
  }
}
