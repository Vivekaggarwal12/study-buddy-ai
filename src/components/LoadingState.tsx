import { motion } from "framer-motion";

const LoadingState = () => {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-3 mb-6">
          <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-sm font-medium text-primary">Generating study materials...</span>
        </div>

        <div className="space-y-4 max-w-xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-3">
                <div
                  className="h-4 rounded-full bg-muted animate-pulse-gentle"
                  style={{ width: `${70 + i * 10}%`, animationDelay: `${i * 0.2}s` }}
                />
                <div
                  className="h-4 rounded-full bg-muted animate-pulse-gentle"
                  style={{ width: `${50 + i * 15}%`, animationDelay: `${i * 0.3}s` }}
                />
                <div
                  className="h-4 rounded-full bg-muted animate-pulse-gentle"
                  style={{ width: `${40 + i * 10}%`, animationDelay: `${i * 0.4}s` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingState;
