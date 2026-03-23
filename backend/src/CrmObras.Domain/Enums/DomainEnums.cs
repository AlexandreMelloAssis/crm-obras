namespace CrmObras.Domain.Enums;

public enum UserProfile { Admin = 1, Manager = 2, Engineer = 3, Viewer = 4 }
public enum WorkStatus { Planning = 1, InProgress = 2, Paused = 3, Completed = 4 }
public enum WorkStageStatus { Pending = 1, InProgress = 2, Completed = 3 }
public enum DocumentStatus { PendingReview = 1, Approved = 2, Rejected = 3 }
public enum DocumentCategoryType { Invoice = 1, NegotiationPrint = 2, Budget = 3, TechnicalBlueprint = 4, Other = 5 }
public enum BudgetStatus { Draft = 1, Approved = 2, Rejected = 3 }
public enum CostType { Labor = 1, Utility = 2, Material = 3, Misc = 4 }
public enum MaterialCategory { Structural = 1, Finishing = 2, Electrical = 3, Hydraulic = 4, Tools = 5 }

