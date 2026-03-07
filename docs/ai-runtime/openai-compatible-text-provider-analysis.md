# [VAT] OpenAI-Compatible Text Provider (Parallel with OpenRouter)

## 1) Điểm đang dùng OpenRouter cho text generation/service

### Runtime text generation
- `src/lib/llm/chat-completion.ts`
  - Nhánh `isOpenRouter = config.baseUrl?.includes('openrouter')`
  - OpenRouter đi theo OpenAI SDK (`client.chat.completions.create(...)`).
- `src/lib/llm/chat-stream.ts`
  - Nhánh stream riêng cho OpenRouter (`providerName = 'openrouter'`), có xử lý reasoning/stream chunks.

### Provider/config resolution
- `src/lib/api-config.ts`
  - Trước đây chỉ đọc provider từ user config (`customProviders`) và bắt buộc `apiKey` cho mọi provider.
  - Sau thay đổi: bổ sung env fallback + strategy no-key có điều kiện cho `openai-compatible`.

### Model resolution for text worker
- `src/lib/workers/handlers/resolve-analysis-model.ts`
  - Trước đây: input -> project -> user preference.
  - Sau thay đổi: thêm fallback theo env `TEXT_PROVIDER` (`openrouter` / `openai-compatible`).

## 2) Kiến trúc provider hiện tại và điểm extension tốt nhất

### Kiến trúc hiện tại
- Model key chuẩn: `provider::modelId`.
- Runtime resolve model qua:
  - `resolveLlmRuntimeModel(...)` -> `resolveModelSelection(...)` / `resolveModelSelectionOrSingle(...)`.
- Provider config lấy từ:
  - `getProviderConfig(...)` trong `src/lib/api-config.ts`.

### Điểm extension tốt nhất
- **`getProviderConfig`** là choke-point phù hợp nhất để:
  - Bổ sung env fallback,
  - Merge custom headers,
  - Áp policy no-key theo provider.
- **`chat-completion.ts` + `chat-stream.ts`** là điểm để inject `headers/defaultHeaders` cho OpenAI-compatible gateways.

## 3) Rủi ro tương thích (chat completions / responses / streaming / retry / timeout)

1. **Chat Completions vs Responses API**
   - VAT text runtime hiện chuẩn hóa theo Chat Completions.
   - Nếu gateway chỉ hỗ trợ Responses API thuần, sẽ cần adapter riêng.

2. **Streaming event shape khác nhau**
   - Một số gateway trả chunk khác chuẩn AI SDK -> có nguy cơ empty response.
   - `chat-stream.ts` đã có guard/diagnostic cho unknown chunks + fallback path.

3. **Auth model linh hoạt (no-key/custom header)**
   - SDK OpenAI yêu cầu `apiKey` string khi khởi tạo; no-key cần truyền placeholder (`'no-key'`) + auth qua headers.
   - Đã xử lý để không hard-fail khi provider là openai-compatible.

4. **Retry/timeout behavior không đồng nhất giữa gateway**
   - Gateway custom có thể timeout sớm hoặc không trả usage.
   - Runtime hiện đã có maxRetries + logging chi tiết (không đổi behavior OpenRouter).

5. **Không breaking OpenRouter**
   - Policy bắt buộc key cho OpenRouter vẫn giữ nguyên.
   - Test regression đã cover case này.
