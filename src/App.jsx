import { useState } from "react";

function App() {
  const [usernames, setUsernames] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    gfg: ""
  });

  const [platformData, setPlatformData] = useState({
    leetcode: null,
    codeforces: null,
    codechef: null,
    gfg: null
  });

  const [loading, setLoading] = useState({
    leetcode: false,
    codeforces: false,
    codechef: false,
    gfg: false
  });

  const [errors, setErrors] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    gfg: ""
  });

  const platforms = [
    {
      id: "leetcode",
      name: "LeetCode",
      icon: "🏆",
      color: "#FFA116",
      endpoint: "http://localhost:3001/api/leetcode"
    },
    {
      id: "codeforces",
      name: "Codeforces",
      icon: "⚡",
      color: "#EF1A45",
      endpoint: "http://localhost:3001/api/codeforces"
    },
    {
      id: "codechef",
      name: "CodeChef",
      icon: "🍳",
      color: "#5B4534",
      endpoint: "http://localhost:3001/api/codechef"
    },
    {
      id: "gfg",
      name: "GeeksForGeeks",
      icon: "💻",
      color: "#2F8D46",
      endpoint: "http://localhost:3001/api/gfg"
    }
  ];

  const handleInputChange = (platform, value) => {
    setUsernames(prev => ({ ...prev, [platform]: value }));
  };

  const fetchData = async (platformId) => {
    const username = usernames[platformId].trim();
    if (!username) return;

    setLoading(prev => ({ ...prev, [platformId]: true }));
    setErrors(prev => ({ ...prev, [platformId]: "" }));

    try {
      const platform = platforms.find(p => p.id === platformId);
      const res = await fetch(`${platform.endpoint}?username=${username}`);
      const data = await res.json();

      if (res.ok) {
        setPlatformData(prev => ({ ...prev, [platformId]: data }));
      } else {
        setErrors(prev => ({ ...prev, [platformId]: data.error || "Failed to fetch" }));
        setPlatformData(prev => ({ ...prev, [platformId]: null }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [platformId]: "Network error" }));
      setPlatformData(prev => ({ ...prev, [platformId]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };

  const fetchAll = () => {
    Object.keys(usernames).forEach(platformId => {
      if (usernames[platformId].trim()) {
        fetchData(platformId);
      }
    });
  };

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.backgroundContainer}>
        <div style={{ ...styles.blob, ...styles.blob1 }}></div>
        <div style={{ ...styles.blob, ...styles.blob2 }}></div>
        <div style={{ ...styles.blob, ...styles.blob3 }}></div>
      </div>

      <div style={styles.content}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <div style={styles.headerIcon}>
            <span style={{ fontSize: "2rem" }}>💻</span>
          </div>
          <div>
            <h1 style={styles.mainTitle}>Code Profile Aggregator</h1>
            <p style={styles.subtitle}>Track your progress across all major coding platforms</p>
          </div>
        </div>

        {/* Input Cards Grid */}
        <div style={styles.gridContainer}>
          {platforms.map(platform => (
            <div key={platform.id} style={styles.inputCard}>
              <div style={styles.cardHeader}>
                <span style={styles.platformIcon}>{platform.icon}</span>
                <h2 style={styles.platformName}>{platform.name}</h2>
              </div>

              <input
                type="text"
                placeholder="Enter username..."
                value={usernames[platform.id]}
                onChange={(e) => handleInputChange(platform.id, e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchData(platform.id)}
                style={styles.input}
              />

              <button
                onClick={() => fetchData(platform.id)}
                disabled={loading[platform.id]}
                style={{
                  ...styles.fetchButton,
                  borderColor: platform.color,
                  color: platform.color,
                  opacity: loading[platform.id] ? 0.6 : 1
                }}
              >
                {loading[platform.id] ? "⏳ Fetching..." : "⚡ Fetch"}
              </button>

              {errors[platform.id] && (
                <div style={styles.errorMessage}>
                  ❌ {errors[platform.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fetch All Button */}
        <div style={styles.fetchAllContainer}>
          <button
            onClick={fetchAll}
            disabled={Object.values(loading).some(l => l)}
            style={{
              ...styles.fetchAllButton,
              opacity: Object.values(loading).some(l => l) ? 0.5 : 1,
              cursor: Object.values(loading).some(l => l) ? "not-allowed" : "pointer"
            }}
          >
            ⚡ Fetch All Profiles
          </button>
        </div>

        {/* Results Grid */}
        <div style={styles.gridContainer}>
          {platforms.map(platform => (
            <div key={`result-${platform.id}`} style={styles.resultCard}>
              <div style={styles.cardHeader}>
                <span style={styles.platformIcon}>{platform.icon}</span>
                <h3 style={styles.platformNameResult}>{platform.name}</h3>
              </div>

              {loading[platform.id] && (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinnerAnimation}>⏳</div>
                  <p style={styles.loadingText}>Loading stats...</p>
                </div>
              )}

              {!loading[platform.id] && platformData[platform.id] && (
                <div style={styles.statsContainer}>
                  {platform.id === "leetcode" && (
                    <div>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Total Solved</p>
                          <p style={styles.statValue}>{platformData[platform.id].total || 0}</p>
                        </div>
                        <span style={styles.statIcon}>📊</span>
                      </div>
                      <div style={styles.difficultyGrid}>
                        <div style={styles.difficultyBox}>
                          <div style={{ color: "#22c55e", fontSize: "1.5rem", fontWeight: "bold" }}>
                            {platformData[platform.id].easy || 0}
                          </div>
                          <div style={styles.difficultyLabel}>Easy</div>
                        </div>
                        <div style={styles.difficultyBox}>
                          <div style={{ color: "#eab308", fontSize: "1.5rem", fontWeight: "bold" }}>
                            {platformData[platform.id].medium || 0}
                          </div>
                          <div style={styles.difficultyLabel}>Medium</div>
                        </div>
                        <div style={styles.difficultyBox}>
                          <div style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: "bold" }}>
                            {platformData[platform.id].hard || 0}
                          </div>
                          <div style={styles.difficultyLabel}>Hard</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {platform.id === "codeforces" && (
                    <div style={styles.statsContent}>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Current Rating</p>
                          <p style={styles.statValue}>{platformData[platform.id].rating}</p>
                        </div>
                        <span style={styles.statIcon}>⭐</span>
                      </div>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Max Rating</p>
                          <p style={styles.statValue}>{platformData[platform.id].maxRating}</p>
                        </div>
                        <span style={styles.statIcon}>🚀</span>
                      </div>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Rank</p>
                          <p style={styles.statValue}>{platformData[platform.id].rank || "N/A"}</p>
                        </div>
                        <span style={styles.statIcon}>🏅</span>
                      </div>
                    </div>
                  )}

                  {platform.id === "codechef" && (
                    <div style={styles.statsContent}>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Rating</p>
                          <p style={styles.statValue}>{platformData[platform.id].rating}</p>
                        </div>
                        <span style={styles.statIcon}>⭐</span>
                      </div>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Stars</p>
                          <p style={styles.statValue}>{platformData[platform.id].stars || "N/A"}</p>
                        </div>
                        <span style={styles.statIcon}>✨</span>
                      </div>
                    </div>
                  )}

                  {platform.id === "gfg" && (
                    <div style={styles.statsContent}>
                      <div style={styles.statItem}>
                        <div>
                          <p style={styles.statLabel}>Problems Solved</p>
                          <p style={styles.statValue}>{platformData[platform.id].solved}</p>
                        </div>
                        <span style={styles.statIcon}>✅</span>
                      </div>
                    </div>
                  )}

                  <div style={styles.successMessage}>
                    ✅ Data loaded successfully
                  </div>
                </div>
              )}

              {!loading[platform.id] && !platformData[platform.id] && (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📭</div>
                  <p style={styles.emptyText}>No data yet</p>
                  <p style={styles.emptySubtext}>Enter username to fetch stats</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .blob-1 {
          animation: blob 7s infinite;
        }

        .blob-2 {
          animation: blob 7s infinite;
          animation-delay: 2s;
        }

        .blob-3 {
          animation: blob 7s infinite;
          animation-delay: 4s;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Outfit', sans-serif"
  },

  backgroundContainer: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none"
  },

  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.3
  },

  blob1: {
    width: "400px",
    height: "400px",
    top: "0",
    left: "25%",
    background: "#3b82f6",
    className: "blob-1"
  },

  blob2: {
    width: "400px",
    height: "400px",
    top: "33%",
    right: "25%",
    background: "#a855f7",
    className: "blob-2"
  },

  blob3: {
    width: "400px",
    height: "400px",
    bottom: "0",
    left: "50%",
    background: "#ec4899",
    className: "blob-3"
  },

  content: {
    position: "relative",
    zIndex: 10,
    padding: "3rem 1rem",
    maxWidth: "1280px",
    margin: "0 auto"
  },

  headerSection: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "4rem"
  },

  headerIcon: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  mainTitle: {
    fontSize: "3rem",
    fontWeight: "900",
    color: "#fff",
    margin: "0 0 0.5rem 0",
    background: "linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #f472b6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "1.125rem",
    fontWeight: "300",
    margin: 0
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem"
  },

  inputCard: {
    background: "rgba(30, 41, 59, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    borderRadius: "1.5rem",
    padding: "1.5rem",
    transition: "all 0.3s ease"
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem"
  },

  platformIcon: {
    fontSize: "1.875rem"
  },

  platformName: {
    fontSize: "1.125rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0
  },

  platformNameResult: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0
  },

  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    borderRadius: "0.5rem",
    color: "#fff",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s ease",
    boxSizing: "border-box"
  },

  fetchButton: {
    width: "100%",
    padding: "0.625rem 1rem",
    background: "transparent",
    border: "2px solid",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Outfit', sans-serif"
  },

  fetchAllContainer: {
    marginBottom: "3rem"
  },

  fetchAllButton: {
    width: "100%",
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #fcd34d 0%, #fef08a 50%, #fcd34d 100%)",
    color: "#000",
    border: "none",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(252, 211, 77, 0.3)",
    transition: "all 0.3s ease",
    fontFamily: "'Outfit', sans-serif"
  },

  resultCard: {
    background: "rgba(30, 41, 59, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    borderRadius: "1.5rem",
    padding: "2rem",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease"
  },

  loadingContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },

  spinnerAnimation: {
    fontSize: "2rem",
    marginBottom: "0.75rem",
    animation: "spin 1s linear infinite"
  },

  loadingText: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    margin: 0
  },

  statsContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  statsContent: {
    space: "1rem"
  },

  statItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem",
    background: "rgba(15, 23, 42, 0.3)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(100, 116, 139, 0.2)",
    marginBottom: "1rem",
    transition: "all 0.2s ease"
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "0.75rem",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0
  },

  statValue: {
    color: "#e2e8f0",
    fontSize: "1.5rem",
    fontWeight: "700",
    marginTop: "0.25rem",
    margin: 0
  },

  statIcon: {
    fontSize: "1.875rem"
  },

  difficultyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(100, 116, 139, 0.2)"
  },

  difficultyBox: {
    textAlign: "center"
  },

  difficultyLabel: {
    color: "#64748b",
    fontSize: "0.75rem",
    marginTop: "0.25rem"
  },

  successMessage: {
    marginTop: "auto",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(100, 116, 139, 0.2)",
    color: "#4ade80",
    fontSize: "0.875rem",
    fontWeight: "600"
  },

  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    margin: 0
  },

  emptySubtext: {
    color: "#64748b",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
    margin: 0
  },

  errorMessage: {
    marginTop: "0.75rem",
    padding: "0.75rem",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "0.5rem",
    color: "#fca5a5",
    fontSize: "0.75rem"
  }
};

export default App;