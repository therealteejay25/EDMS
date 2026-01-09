export function titleCase(input: string) {
    return String(input)
        .replace(/_/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export function shortId(id?: string, size = 6) {
    if (!id) return "";
    const s = String(id);
    if (s.length <= size * 2 + 1) return s;
    return `${s.slice(0, size)}…${s.slice(-size)}`;
}

export function roleLabel(role?: string) {
    if (!role) return "";
    const map: Record<string, string> = {
        admin: "Administrator",
        department_lead: "Department Lead",
        user: "User",
    };
    return map[role] || titleCase(role);
}

export function approvalStatusLabel(status?: string) {
    if (!status) return "";
    const map: Record<string, string> = {
        pending: "Pending Approval",
        approved: "Approved",
        rejected: "Rejected",
        escalated: "Escalated",
    };
    return map[status] || titleCase(status);
}

export function documentStatusLabel(status?: string) {
    if (!status) return "";
    const map: Record<string, string> = {
        draft: "Draft",
        active: "Active",
        archived: "Archived",
        expired: "Expired",
    };
    return map[status] || titleCase(status);
}

export function priorityLabel(priority?: string) {
    if (!priority) return "";
    const map: Record<string, string> = {
        low: "Low Priority",
        medium: "Medium Priority",
        high: "High Priority",
    };
    return map[priority] || titleCase(priority);
}

export function workflowTriggerLabel(trigger?: string) {
    if (!trigger) return "";
    const map: Record<string, string> = {
        document_type: "Document Type",
        department: "Department",
        manual: "Manual",
    };
    return map[trigger] || titleCase(trigger);
}

export function auditActionLabel(action?: string) {
    if (!action) return "";
    const map: Record<string, string> = {
        workflow_created: "Workflow created",
        workflow_updated: "Workflow updated",
        workflow_deleted: "Workflow deleted",
        document_created: "Document created",
        document_versioned: "Document version updated",
        document_restored: "Document restored",
        document_archived: "Document archived",
        document_tagged: "Document tagged",
        document_commented: "Comment added to document",
        approval_requested: "Approval requested",
        document_approved: "Document approved",
        document_rejected: "Document rejected",
        approval_escalated: "Approval escalated",
        bulk_approval: "Bulk approvals processed",
        documents_pruned: "Old documents pruned",
    };
    return map[action] || titleCase(action);
}
