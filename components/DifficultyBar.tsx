interface DifficultyBarProps {
  level: string;
}

export default function DifficultyBar({ level }: DifficultyBarProps) {
  const getPercentage = () => {
    switch (level) {
      case "Lätt":
        return 30;
      case "Medel":
        return 60;
      case "Avancerat":
        return 90;
      default:
        return 30;
    }
  };

  const percentage = getPercentage();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600 min-w-[70px]">{level}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-900 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 min-w-[35px]">{percentage}%</span>
      </div>
    </div>
  );
}
