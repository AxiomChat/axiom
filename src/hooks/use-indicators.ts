import { IndicatorContext } from "@/types/protocol";
import { useEffect, useState } from "react";

export default function useIndicators() {
  const [indicators, setIndicators] = useState<IndicatorContext[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicators((prev) =>
        prev
          .map((item) => ({
            ...item,
            expires: item.expires - 1,
          }))
          .filter((item) => item.expires > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    indicators,
    setIndicators,
    addIndicator: (i: IndicatorContext) => {
      setIndicators((prev) => {
        const combined = [...prev, { ...i }];
        const uniqueByUser = combined.reduce<Record<string, typeof i>>(
          (acc, curr) => {
            const userId = curr.indicator.params.user_id;
            if (!acc[userId] || curr.expires > acc[userId].expires) {
              acc[userId] = curr;
            }
            return acc;
          },
          {}
        );

        return Object.values(uniqueByUser);
      });
    },
  };
}
