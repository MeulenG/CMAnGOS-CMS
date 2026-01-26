using System.Numerics;
using System.Security.Cryptography;
using System.Text;

namespace CMAnGOS_CMS_API.Server.Helpers
{
    public class SRP6Helper
    {
        private static readonly BigInteger N = BigInteger.Parse(
            "894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7",
            System.Globalization.NumberStyles.HexNumber);

        private static readonly BigInteger g = new BigInteger(7);

        public byte[] Salt { get; private set; }
        public byte[] Verifier { get; private set; }

        public SRP6Helper()
        {
            Salt = new byte[32];
            Verifier = Array.Empty<byte>();
        }

        public void CalculateVerifier(string shaPassHash)
        {
            // Generate random salt
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(Salt);
            }

            byte[] credentials = HexStringToByteArray(shaPassHash);

            byte[] xBytes = HashWithSalt(Salt, credentials);
            
            byte[] xBytesReversed = xBytes.Reverse().ToArray();
            byte[] xBytesUnsigned = new byte[xBytesReversed.Length + 1];
            Buffer.BlockCopy(xBytesReversed, 0, xBytesUnsigned, 0, xBytesReversed.Length);
            xBytesUnsigned[xBytesUnsigned.Length - 1] = 0x00;
            
            BigInteger x = new BigInteger(xBytesUnsigned);

            BigInteger v = BigInteger.ModPow(g, x, N);

            Verifier = ToByteArray(v, 32);
        }

        public string GetSaltHex()
        {
            return ByteArrayToHexString(Salt.Reverse().ToArray());
        }

        public string GetVerifierHex()
        {
            return ByteArrayToHexString(Verifier.Reverse().ToArray());
        }

        private byte[] HashWithSalt(byte[] salt, byte[] credentials)
        {
            using (var sha1 = SHA1.Create())
            {
                byte[] combined = new byte[salt.Length + credentials.Length];
                Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
                Buffer.BlockCopy(credentials, 0, combined, salt.Length, credentials.Length);
                return sha1.ComputeHash(combined);
            }
        }

        private byte[] ToByteArray(BigInteger value, int length)
        {
            byte[] bytes = value.ToByteArray();
            
            if (bytes.Length == length)
                return bytes;

            byte[] result = new byte[length];
            if (bytes.Length < length)
            {
                Buffer.BlockCopy(bytes, 0, result, 0, bytes.Length);
            }
            else
            {
                Buffer.BlockCopy(bytes, 0, result, 0, length);
            }
            
            return result;
        }

        private byte[] HexStringToByteArray(string hex)
        {
            int length = hex.Length;
            byte[] bytes = new byte[length / 2];
            for (int i = 0; i < length; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            }
            return bytes;
        }

        private string ByteArrayToHexString(byte[] bytes)
        {
            return BitConverter.ToString(bytes).Replace("-", string.Empty);
        }
    }
}
