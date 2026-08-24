// src/pages/CountMoney__page.tsx
import React, { useEffect, useState } from "react";
import { getUserData, updateUserData } from "../services/firebase";
import { useAppSelector } from "../redux/store";
import { Line } from "react-chartjs-2";
import ActionButton from "../components/ActionButton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { MoneyGoal, MoneyHistoryItem, MoneyCount } from "../types";
import ForgeLoader from "../components/ForgeLoader";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const formatTimestampChart = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}.${month}.${year}`;
};

const CountMoneyPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [inputMoney, setInputMoney] = useState<number>(0);
  const [moneyDivider, setMoneyDivider] = useState<number>(5000);
  const [moneyDividerDisplay, setMoneyDividerDisplay] = useState<number>(5000);
  const [displayedMoney, setDisplayedMoney] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [oldDataArray, setOldDataArray] = useState<MoneyHistoryItem[]>([]);
  const [moneyGoalsArray, setMoneyGoalsArray] = useState<MoneyGoal[]>([]);

  const [newFinancialGoal, setNewFinancialGoal] = useState<string>("");
  const [newFinancialGoalPrice, setNewFinancialGoalPrice] = useState<string>("");
  const [addNewGoalVisible, setAddNewGoalVisible] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setInputMoney(val);
    }
  };

  const handleDividerChangeDisplay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setMoneyDividerDisplay(val);
    }
  };

  // Сохранение баланса в Firebase
  const handleConfirmMoney = async () => {
    if (!user?.uid) return;

    const moneyObject: MoneyCount = {
      sum: inputMoney,
      divider: moneyDividerDisplay,
    };
    await updateUserData(user.uid, "money_count", moneyObject);

    const dateNow = Date.now();
    const historyObject: MoneyHistoryItem = {
      sum: inputMoney,
      date: dateNow,
    };

    const updatedHistory = [...oldDataArray, historyObject];
    await updateUserData(user.uid, "money_history", JSON.stringify(updatedHistory));

    setDisplayedMoney(inputMoney);
    setMoneyDivider(moneyDividerDisplay);
    setOldDataArray(updatedHistory);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      try {
        const data = await getUserData(user.uid);

        if (data) {
          const sum = data.money_count?.sum ?? 0;
          const divider = data.money_count?.divider || 5000;

          setInputMoney(sum);
          setDisplayedMoney(sum);
          setMoneyDivider(divider);
          setMoneyDividerDisplay(divider);

          if (data.money_history) {
            try {
              setOldDataArray(JSON.parse(data.money_history));
            } catch (e) {
              setOldDataArray([]);
            }
          }

          if (data.money_goals) {
            try {
              setMoneyGoalsArray(JSON.parse(data.money_goals));
            } catch (e) {
              setMoneyGoalsArray([]);
            }
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке финансовых данных:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleChangeNewGoalPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setNewFinancialGoalPrice(val);
    }
  };

  const handleDeleteGoal = async (name: string) => {
    if (!user?.uid) return;
    const isConfirmed = window.confirm(`Вы уверены, что хотите удалить цель "${name}"?`);
    if (isConfirmed) {
      const filteredArray = moneyGoalsArray.filter((goal) => goal.name !== name);
      setMoneyGoalsArray(filteredArray);
      await updateUserData(user.uid, "money_goals", JSON.stringify(filteredArray));
    }
  };

  const addNewFinancialGoalToServer = async () => {
    if (!user?.uid) return;

    if (!newFinancialGoal.trim()) {
      alert("Пожалуйста, введите название цели.");
      return;
    }

    const priceNum = Number(newFinancialGoalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Пожалуйста, введите корректную цену (число больше 0).");
      return;
    }

    const sendObject: MoneyGoal = {
      name: newFinancialGoal.trim(),
      price: priceNum,
    };

    const updatedGoals = [...moneyGoalsArray, sendObject];
    await updateUserData(user.uid, "money_goals", JSON.stringify(updatedGoals));

    setMoneyGoalsArray(updatedGoals);
    setAddNewGoalVisible(false);
    setNewFinancialGoal("");
    setNewFinancialGoalPrice("");
  };

  const generateBlocksMode2 = () => {
    const divider = moneyDivider > 0 ? moneyDivider : 5000;
    let textDividerDisplay: string | number = divider;

    if (divider >= 1000) {
      textDividerDisplay = divider % 1000 === 0 ? `${(divider / 1000).toFixed(0)}k` : `${(divider / 1000).toFixed(1)}k`;
    }

    const blocks: React.JSX.Element[] = [];
    const blockAmount = Math.ceil(displayedMoney / divider);
    const remainder = displayedMoney % divider;

    let textRemainderDisplay: string | number = remainder;
    if (remainder >= 1000) {
      textRemainderDisplay = remainder % 1000 === 0 ? `${(remainder / 1000).toFixed(0)}k` : `${(remainder / 1000).toFixed(1)}k`;
    }

    const widthPercent = (remainder / divider) * 100;
    const indexGenerate = remainder === 0 ? 0 : 1;

    for (let i = indexGenerate; i < blockAmount; i++) {
      blocks.push(
        <div
          key={`full-${i}`}
          style={{
            width: "100%",
            height: "44px",
            backgroundColor: "#00ff15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontWeight: "bold",
            borderRadius: "4px",
            boxShadow: "0 0 10px rgba(0, 255, 21, 0.2)",
          }}
        >
          {textDividerDisplay}
        </div>
      );
    }

    if (remainder > 0) {
      blocks.push(
        <div
          key="remainder-block"
          style={{
            width: "100%",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            border: "1px solid #333",
            backgroundColor: "#111",
            borderRadius: "4px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${widthPercent}%`,
              height: "100%",
              backgroundColor: "#00ff15",
              position: "absolute",
              left: 0,
              top: 0,
              transition: "width 0.3s ease",
            }}
          />
          <p
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <span
              style={{
                color: "#000",
                padding: "2px 6px",
                fontWeight: "bold",
                borderRadius: "3px",
                fontSize: "12px",
                backgroundColor: "rgba(0, 255, 21, 0.8)",
              }}
            >
              {textRemainderDisplay}
            </span>
          </p>
        </div>
      );
    }

    return blocks;
  };

  const chartData: ChartData<"line"> = {
    labels: oldDataArray.map((item) => formatTimestampChart(item.date)),
    datasets: [
      {
        label: "Баланс (₽)",
        data: oldDataArray.map((item) => item.sum),
        borderColor: "#00ff15",
        backgroundColor: "rgba(0, 255, 21, 0.08)",
        pointBackgroundColor: "#00ff15",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.25,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#111",
        titleColor: "#00ff15",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
        callbacks: {
          label: (context) => `Баланс: ${Number(context.raw).toLocaleString("ru-RU")} ₽`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#1a1a1a" },
        ticks: { color: "#888", font: { size: 11 } },
      },
      y: {
        grid: { color: "#1a1a1a" },
        ticks: {
          color: "#00ff15",
          font: { size: 11 },
          callback: (value) => `${Number(value).toLocaleString("ru-RU")} ₽`,
        },
      },
    },
  };

  if (isLoading) {
  return (
    <ForgeLoader
      title="КАПИТАЛ // СИНХРОНИЗАЦИЯ"
      logs={["FETCHING_LEDGER...", "BUILDING_CHART...", "UPDATING_GOALS..."]}
    />
  );
}

  const remainderToNext = moneyDivider - (displayedMoney % moneyDivider);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "950px", margin: "0 auto" }}>
      <div className="countMoney_container">
        <div>
          <h1 style={{ marginBottom: "20px" }}>
            FORGE<span style={{ color: "#00ff15" }}>OS</span> // КАПИТАЛ
          </h1>

          {/* Форма ввода баланса */}
          <div
            style={{
              backgroundColor: "#111",
              border: "1px solid #222",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "25px",
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              alignItems: "flex-end",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                Сумма баланса (₽):
              </label>
              <input
                type="number"
                value={inputMoney || ""}
                onChange={handleInputChange}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#181818",
                  border: "1px solid #333",
                  color: "#00ff15",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                Делитель блока (₽):
              </label>
              <input
                type="number"
                step="500"
                value={moneyDividerDisplay || ""}
                onChange={handleDividerChangeDisplay}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#181818",
                  border: "1px solid #333",
                  color: "#fff",
                  fontSize: "16px",
                  borderRadius: "4px",
                }}
              />
            </div>

            <ActionButton
              onClick={handleConfirmMoney}
              loadingText="Синхронизация..."
              successText="✓ Баланс зафиксирован!"
              style={{ padding: "10px 18px" }}
            >
              + Зафиксировать баланс
            </ActionButton>
          </div>

          {/* Сводка баланса */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ fontSize: "18px", color: "#ddd", marginBottom: "4px" }}>
              Текущий капитал: <strong style={{ color: "#00ff15", fontSize: "24px" }}>{displayedMoney.toLocaleString("ru-RU")}</strong> ₽
            </div>
            <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
              До следующего блока в {moneyDivider.toLocaleString("ru-RU")} ₽ осталось заработать:{" "}
              <strong style={{ color: "#00ff15" }}>{remainderToNext.toLocaleString("ru-RU")} ₽</strong>
            </p>

            {/* Сетка кубиков капитала */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(65px, 1fr))",
                width: "100%",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              {generateBlocksMode2()}
            </div>
          </div>
        </div>

        {/* График динамики капитала */}
        <div style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "16px 20px", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#fff" }}>📈 Динамика накопления капитала</h3>
          <div style={{ height: "260px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Секция финансовых целей */}
        <div style={{ borderTop: "1px solid #222", paddingTop: "25px", marginBottom: "50px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#00ff15" }}>🎯 Финансовые цели</h2>
            {!addNewGoalVisible && (
              <button
                onClick={() => setAddNewGoalVisible(true)}
                style={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #333",
                  color: "#00ff15",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                + Новая цель
              </button>
            )}
          </div>

          {/* Форма создания новой цели */}
          {addNewGoalVisible && (
            <div
              style={{
                backgroundColor: "#111",
                border: "1px solid #00ff1544",
                borderRadius: "6px",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <input
                value={newFinancialGoal}
                onChange={(e) => setNewFinancialGoal(e.target.value)}
                placeholder="Название цели (например: Ноутбук)..."
                type="text"
                style={{ flex: 1, minWidth: "180px", padding: "8px 10px", backgroundColor: "#181818", border: "1px solid #333", color: "#fff", borderRadius: "4px" }}
              />
              <input
                value={newFinancialGoalPrice}
                placeholder="Стоимость (₽)..."
                onChange={handleChangeNewGoalPrice}
                type="text"
                pattern="\d*"
                style={{ width: "130px", padding: "8px 10px", backgroundColor: "#181818", border: "1px solid #333", color: "#00ff15", borderRadius: "4px" }}
              />
              <ActionButton
                onClick={addNewFinancialGoalToServer}
                loadingText="Сохранение..."
                successText="✓ Добавлено"
                disabled={!newFinancialGoal.trim() || !newFinancialGoalPrice}
                style={{ padding: "8px 14px" }}
              >
                Добавить цель
              </ActionButton>
              <button
                onClick={() => setAddNewGoalVisible(false)}
                style={{ backgroundColor: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "13px" }}
              >
                Отмена
              </button>
            </div>
          )}

          {/* Список целей с прогресс-барами */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {moneyGoalsArray.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>Целей пока нет. Добавь первую цель выше.</p>
            ) : (
              moneyGoalsArray.map((goal, index) => {
                const progress = Math.min((displayedMoney / goal.price) * 100, 100);
                const isCompleted = displayedMoney >= goal.price;

                return (
                  <div
                    key={`${goal.name}-${index}`}
                    style={{
                      backgroundColor: "#111",
                      border: `1px solid ${isCompleted ? "#00ff1566" : "#222"}`,
                      borderRadius: "6px",
                      padding: "14px 18px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", color: isCompleted ? "#00ff15" : "#fff" }}>
                          {goal.name} {isCompleted && "👑"}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          ({goal.price.toLocaleString("ru-RU")} ₽)
                        </span>
                      </div>
                      <ActionButton
                        onClick={() => handleDeleteGoal(goal.name)}
                        variant="danger"
                        loadingText="..."
                        successText="✓"
                        style={{ padding: "3px 8px", fontSize: "12px" }}
                      >
                        Удалить
                      </ActionButton>
                    </div>

                    {/* Полоса прогресса */}
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "#222",
                        borderRadius: "3px",
                        overflow: "hidden",
                        margin: "8px 0",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          backgroundColor: "#00ff15",
                          boxShadow: "0 0 8px rgba(0, 255, 21, 0.4)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#aaa" }}>
                      <span>Прогресс: <strong style={{ color: "#00ff15" }}>{progress.toFixed(1)}%</strong></span>
                      <span>
                        {isCompleted
                          ? "Цель достигнута!"
                          : `Осталось накопить: ${(goal.price - displayedMoney).toLocaleString("ru-RU")} ₽`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CountMoneyPage;