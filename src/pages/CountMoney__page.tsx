// src/pages/CountMoney__page.tsx
import React, { useEffect, useState } from "react";
import { getUserData, updateUserData } from "../services/firebase";
import { useAppSelector } from "../redux/store";
import { Line } from "react-chartjs-2";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const submitMoneyFirebaseRequest = async (currentInputMoney: number, currentDivider: number) => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const moneyObject: MoneyCount = {
        sum: currentInputMoney,
        divider: currentDivider,
      };
      await updateUserData(user.uid, "money_count", moneyObject);

      const dateNow = Date.now();
      const historyObject: MoneyHistoryItem = {
        sum: currentInputMoney,
        date: dateNow,
      };

      const updatedHistory = [...oldDataArray, historyObject];
      await updateUserData(user.uid, "money_history", JSON.stringify(updatedHistory));
      setOldDataArray(updatedHistory);
    } catch (error) {
      console.error("Ошибка при обновлении данных денег:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMoney = () => {
    setDisplayedMoney(inputMoney);
    setMoneyDivider(moneyDividerDisplay);
    submitMoneyFirebaseRequest(inputMoney, moneyDividerDisplay);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      try {
        setIsLoading(true);
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
      setAddNewGoalVisible(false);
      return;
    }

    const priceNum = Number(newFinancialGoalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Пожалуйста, введите корректную цену (число больше 0).");
      setAddNewGoalVisible(false);
      return;
    }

    const sendObject: MoneyGoal = {
      name: newFinancialGoal.trim(),
      price: priceNum,
    };

    const updatedGoals = [...moneyGoalsArray, sendObject];
    setMoneyGoalsArray(updatedGoals);
    setAddNewGoalVisible(false);
    setNewFinancialGoal("");
    setNewFinancialGoalPrice("");

    await updateUserData(user.uid, "money_goals", JSON.stringify(updatedGoals));
  };

  const generateBlocksMode2 = () => {
    const divider = moneyDivider > 0 ? moneyDivider : 5000;
    let textDividerDisplay: string | number = divider;

    if (divider > 1000) {
      if (divider % 1000 === 0) {
        textDividerDisplay = (divider / 1000).toFixed(0) + "k";
      } else {
        textDividerDisplay = (divider / 1000).toFixed(1) + "k";
      }
    }

    const blocks: React.JSX.Element[] = [];
    const blockAmount = Math.ceil(displayedMoney / divider);
    const remainder = displayedMoney % divider;

    let textRemainderDisplay: string | number = remainder;
    if (remainder > 1000) {
      if (remainder % 1000 === 0) {
        textRemainderDisplay = (remainder / 1000).toFixed(0) + "k";
      } else {
        textRemainderDisplay = (remainder / 1000).toFixed(1) + "k";
      }
    }

    const widthPercent = (remainder / divider) * 100;
    const indexGenerate = remainder === 0 ? 0 : 1;

    for (let i = indexGenerate; i < blockAmount; i++) {
      blocks.push(
        <div
          key={`full-${i}`}
          style={{
            width: "100%",
            height: "50px",
            backgroundColor: "#00ff15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontWeight: "bold",
            border: "1px solid rgba(255, 255, 255, 0.37)",
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
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            border: "1px solid rgba(255, 255, 255, 0.37)",
            backgroundColor: "#000",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${widthPercent}%`,
              height: "50px",
              backgroundColor: "#00ff15",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          />
          <p
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <span
              style={{
                color: "black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "rgba(93, 255, 107, 0.671)",
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
        label: "Сумма",
        data: oldDataArray.map((item) => item.sum),
        borderColor: "#00ff15",
        backgroundColor: "rgb(50, 252, 0)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: "#fff",
        },
        ticks: {
          color: "#fff",
          font: {
            size: 12,
          },
        },
        border: {
          display: true,
          color: "#fff",
        },
      },
      y: {
        grid: {
          display: false,
          color: "#fff",
        },
        ticks: {
          color: "#fff",
          font: {
            size: 12,
          },
          callback: (value) => `${value}₽`,
        },
        border: {
          display: true,
          color: "#fff",
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  if (isLoading) {
    return (
      <div>
        <p>Загрузка из базы данных... подождите...</p>
      </div>
    );
  }

  return (
    <div className="countMoney_container">
      <div>
        <h1>Счетчик денег</h1>

        <div>
          <div>
            <span>Введите сумму денег:</span>
            <input
              value={inputMoney || ""}
              onChange={handleInputChange}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
          <div>
            <span>Введите делитель:</span>
            <input
              value={moneyDividerDisplay || ""}
              onChange={handleDividerChangeDisplay}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
          <div>
            <button onClick={confirmMoney} style={{ marginLeft: "0px", padding: "5px 10px" }}>
              Подтвердить
            </button>
          </div>
        </div>

        <div>
          <p>
            Текущая сумма:{" "}
            <strong style={{ color: "#00ff15" }}>{displayedMoney}</strong> ₽
          </p>
          <p>
            Ты можешь заработать еще{" "}
            <strong style={{ color: "#00ff15" }}>
              {moneyDivider - (displayedMoney % moneyDivider)}
            </strong>{" "}
            ?
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              width: "100%",
              maxWidth: "800px",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {generateBlocksMode2()}
          </div>
        </div>
      </div>

      <div className="chartWrap">
        <div className="chartWrap_chart" style={{ height: "300px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="goalsWrap">
          <div>
            {moneyGoalsArray.map((goal, index) => {
              const progress = Math.min((displayedMoney / goal.price) * 100, 100);

              return (
                <div key={`${goal.name}-${index}`} className="goal-container">
                  <div className="goal-container-header">
                    <h3>{goal.name}</h3>
                    <button
                      className="delete-goal-button"
                      onClick={() => handleDeleteGoal(goal.name)}
                    >
                      Удалить цель
                    </button>
                  </div>
                  <p>Цена: {goal.price.toLocaleString("ru-RU")} ₽</p>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p>Прогресс: {progress.toFixed(2)}%</p>
                </div>
              );
            })}
          </div>

          {addNewGoalVisible ? (
            <div>
              <input
                value={newFinancialGoal}
                onChange={(e) => setNewFinancialGoal(e.target.value)}
                placeholder="Введите цель..."
                type="text"
              />
              <input
                value={newFinancialGoalPrice}
                placeholder="Введите цену..."
                onChange={handleChangeNewGoalPrice}
                type="text"
                pattern="\d*"
              />
              <button onClick={addNewFinancialGoalToServer}>Добавить</button>
            </div>
          ) : (
            <button onClick={() => setAddNewGoalVisible(true)}>
              Добавить финансовую цель
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountMoneyPage;