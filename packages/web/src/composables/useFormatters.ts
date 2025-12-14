/**
 * Composable for formatting utilities across the application
 */
export function useFormatters() {
  /**
   * Format a date string to French locale
   */
  function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format a date string to short French locale
   */
  function formatDateShort(date: string | Date): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /**
   * Format a date/time string to French locale
   */
  function formatDateTime(date: string | Date | null): string {
    if (!date) return "Jamais";
    return new Date(date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  type StatusVariant = "secondary" | "primary" | "warning" | "success" | "danger";

  const statusConfig: Record<string, { variant: StatusVariant; label: string }> = {
    draft: { variant: "secondary", label: "Brouillon" },
    registration: { variant: "primary", label: "Inscriptions" },
    in_progress: { variant: "warning", label: "En cours" },
    completed: { variant: "success", label: "Terminé" },
    cancelled: { variant: "danger", label: "Annulé" },
  };

  /**
   * Get status badge variant
   */
  function getStatusVariant(status: string): StatusVariant {
    return statusConfig[status]?.variant || "secondary";
  }

  /**
   * Get status label in French
   */
  function getStatusLabel(status: string): string {
    return statusConfig[status]?.label || status;
  }

  /**
   * Get status config (variant + label)
   */
  function getStatusConfig(status: string) {
    return statusConfig[status] || { variant: "secondary" as StatusVariant, label: status };
  }

  /**
   * Get all status options for select dropdowns
   */
  function getStatusOptions() {
    return Object.entries(statusConfig).map(([value, config]) => ({
      value,
      label: config.label,
    }));
  }

  return {
    formatDate,
    formatDateShort,
    formatDateTime,
    getStatusVariant,
    getStatusLabel,
    getStatusConfig,
    getStatusOptions,
  };
}
